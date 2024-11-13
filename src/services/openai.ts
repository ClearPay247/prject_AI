import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

export const getOpenAISettings = async () => {
  const { data, error } = await supabase
    .from('integration_settings')
    .select('settings')
    .eq('provider', 'openai')
    .single();

  if (error) throw error;
  return data?.settings;
};

export const analyzeCSVFields = async (fields: string[], sampleData: any) => {
  try {
    const settings = await getOpenAISettings();
    if (!settings?.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true
    });

    // Create a simplified sample data object with cleaned values
    const cleanedSampleData: Record<string, string> = {};
    for (const field of fields) {
      const value = sampleData[field];
      cleanedSampleData[field] = value?.toString()?.slice(0, 100) || '';
    }

    const prompt = `Analyze these CSV fields and map them to our database fields. Return ONLY a JSON object with mappings.

CSV Fields with sample data:
${Object.entries(cleanedSampleData).map(([field, value]) => `${field}: ${value}`).join('\n')}

Target Database Fields:
- account_number (unique identifier)
- debtor_name (full name)
- debtor_first_name
- debtor_middle_name
- debtor_last_name
- ssn (social security number)
- phone_number (map any phone number fields to this)
- email
- address
- city
- state
- zip_code
- current_balance (numeric amount)
- original_creditor
- open_date
- charge_off_date
- credit_score (numeric)
- important_notes

Common Field Name Variations:
- Account: acc, acct, account_no, id, number, #
- Name: customer, debtor, borrower, client
- Phone: tel, mobile, cell, contact, phone1, phone2
- Address: addr, street, location, address1
- Balance: amount, debt, due, owed, principal
- Notes: comments, remarks, description, memo

Rules:
1. Map phone_number for ANY field containing phone numbers
2. Map important_notes for ANY field with notes/comments
3. Use sample data to validate field types
4. Skip fields that don't clearly match
5. Map multiple phone fields to phone_number
6. Prefer exact matches over partial matches

Example response format:
{
  "account_no": "account_number",
  "customer_name": "debtor_name",
  "phone1": "phone_number",
  "phone2": "phone_number"
}`;

    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a data mapping assistant. Respond only with a valid JSON object mapping CSV fields to database fields.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const mappingText = response.choices[0]?.message?.content;
    if (!mappingText) {
      console.error('No mapping suggestions received');
      return {};
    }

    try {
      // Find the JSON object in the response
      const jsonMatch = mappingText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response');
        return {};
      }

      const mappings = JSON.parse(jsonMatch[0]);
      
      // Validate mappings
      const validDbFields = new Set([
        'account_number', 'debtor_name', 'debtor_first_name', 'debtor_middle_name',
        'debtor_last_name', 'ssn', 'phone_number', 'email', 'address', 'city',
        'state', 'zip_code', 'current_balance', 'original_creditor', 'open_date',
        'charge_off_date', 'credit_score', 'important_notes'
      ]);

      // Clean up mappings and validate field types
      const cleanedMappings: Record<string, string> = {};
      for (const [csvField, dbField] of Object.entries(mappings)) {
        if (typeof dbField === 'string' && validDbFields.has(dbField)) {
          // Validate the mapping using sample data
          const isValid = validateFieldMapping(dbField, sampleData[csvField]);
          if (isValid) {
            cleanedMappings[csvField] = dbField;
          }
        }
      }

      return cleanedMappings;
    } catch (err) {
      console.error('Failed to parse mapping response:', err);
      return {};
    }
  } catch (err) {
    console.error('CSV analysis error:', err);
    return {};
  }
};

const validateFieldMapping = (dbField: string, sampleValue: any): boolean => {
  if (!sampleValue) return true; // Allow null/empty values

  const value = String(sampleValue).trim();
  if (!value) return true;

  try {
    switch (dbField) {
      case 'ssn':
        return /^\d{3}-?\d{2}-?\d{4}$/.test(value.replace(/\D/g, ''));
      case 'phone_number':
        return value.replace(/\D/g, '').length >= 10;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'state':
        return /^[A-Z]{2}$/.test(value.toUpperCase());
      case 'zip_code':
        return /^\d{5}(-\d{4})?$/.test(value.replace(/\D/g, ''));
      case 'current_balance':
        return !isNaN(parseFloat(value.replace(/[^0-9.-]/g, '')));
      case 'credit_score': {
        const score = parseInt(value);
        return !isNaN(score) && score >= 300 && score <= 850;
      }
      case 'open_date':
      case 'charge_off_date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  } catch {
    return false;
  }
};

export const validateMapping = (mapping: Record<string, string>, sampleData: any) => {
  const issues: string[] = [];
  for (const [csvField, dbField] of Object.entries(mapping)) {
    if (!validateFieldMapping(dbField, sampleData[csvField])) {
      issues.push(`Invalid ${dbField} format in field "${csvField}"`);
    }
  }
  return issues;
};