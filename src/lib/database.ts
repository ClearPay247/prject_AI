import { supabase } from './supabase';
import { cleanCurrencyValue, cleanDateValue } from '../utils/dataCleaners';

export const initializeDatabase = async () => {
  try {
    // Create default clients if they don't exist
    const { data: existingClients } = await supabase
      .from('clients')
      .select('email');

    const defaultClients = [
      { name: 'J&M Automation', email: 'admin@jmautomation.com' },
      { name: 'DRA', email: 'admin@dra.com' }
    ];

    for (const client of defaultClients) {
      if (!existingClients?.some(c => c.email === client.email)) {
        const { error } = await supabase
          .from('clients')
          .insert(client);
        
        if (error) console.error('Failed to create client:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

export const accountService = {
  async batchImportAccounts(accounts: any[], phoneNumbers: Record<string, string[]>) {
    try {
      // Transform account data before insertion
      const transformedAccounts = accounts.map(account => ({
        ...account,
        status: 'New', // Ensure correct case for status
        client_id: account.client_id || '9992443d-f25b-4dec-adae-d1864fb9869f',
        date_of_birth: account.date_of_birth ? cleanDateValue(account.date_of_birth) : null,
        open_date: account.open_date ? cleanDateValue(account.open_date) : null,
        charge_off_date: account.charge_off_date ? cleanDateValue(account.charge_off_date) : null,
        current_balance: cleanCurrencyValue(account.current_balance),
        credit_score: account.credit_score ? parseInt(account.credit_score.toString()) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insert accounts
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert(transformedAccounts)
        .select();

      if (accountError) throw accountError;

      // Insert phone numbers
      if (accountData) {
        const phoneNumberInserts = accountData.flatMap(account => {
          const numbers = phoneNumbers[account.account_number] || [];
          return numbers.map(number => ({
            account_id: account.id,
            number: number.replace(/\D/g, ''),
            status: 'unknown'
          }));
        });

        if (phoneNumberInserts.length > 0) {
          const { error: phoneError } = await supabase
            .from('phone_numbers')
            .insert(phoneNumberInserts);

          if (phoneError) throw phoneError;
        }

        // Record import history
        const { error: historyError } = await supabase
          .from('import_history')
          .insert({
            client_id: transformedAccounts[0].client_id,
            account_count: accountData.length,
            account_ids: accountData.map(a => a.id)
          });

        if (historyError) throw historyError;
      }

      return accountData;
    } catch (error) {
      console.error('Failed to batch import accounts:', error);
      throw error;
    }
  },

  async getImportHistory() {
    try {
      const { data, error } = await supabase
        .from('import_history')
        .select(`
          *,
          client:clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch import history:', error);
      throw error;
    }
  },

  async rollbackImport(importId: string) {
    try {
      const { error } = await supabase
        .rpc('rollback_import', { import_id: importId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to rollback import:', error);
      throw error;
    }
  }
};

export const integrationService = {
  async getBlandSettings() {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('settings')
        .eq('provider', 'bland')
        .single();

      if (error) throw error;
      return data?.settings || null;
    } catch (error) {
      console.error('Failed to get Bland settings:', error);
      return null;
    }
  },

  async saveBlandSettings(settings: any) {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          provider: 'bland',
          settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save Bland settings:', error);
      return false;
    }
  }
};

export const callRuleService = {
  async getCustomRules() {
    try {
      const { data, error } = await supabase
        .from('call_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch custom rules:', error);
      return [];
    }
  },

  async addCustomRule(ruleText: string) {
    try {
      const { data, error } = await supabase
        .from('call_rules')
        .insert({
          rule_text: ruleText,
          is_implemented: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to add custom rule:', error);
      return null;
    }
  },

  async deleteRule(id: string) {
    try {
      const { error } = await supabase
        .from('call_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete rule:', error);
      return false;
    }
  }
};