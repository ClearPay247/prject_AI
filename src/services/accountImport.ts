import { supabase } from '../lib/supabase';

interface ImportAccount {
  account_number: string;
  original_account_number?: string;
  debtor_first_name?: string;
  debtor_middle_name?: string;
  debtor_last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  ssn?: string;
  date_of_birth?: string;
  email?: string;
  current_balance?: number;
  original_creditor?: string;
  open_date?: string;
  charge_off_date?: string;
  credit_score?: number;
  important_notes?: string;
}

export const importAccounts = async (
  accounts: ImportAccount[],
  phoneNumbers: Record<string, string[]>
) => {
  try {
    // Clean and validate account data
    const cleanedAccounts = accounts.map(account => ({
      ...account,
      // Combine name fields into debtor_name
      debtor_name: [account.debtor_first_name, account.debtor_middle_name, account.debtor_last_name]
        .filter(Boolean)
        .join(' '),
      // Clean currency values
      current_balance: account.current_balance 
        ? parseFloat(account.current_balance.toString().replace(/[^0-9.-]/g, ''))
        : null,
      // Format dates
      date_of_birth: account.date_of_birth ? new Date(account.date_of_birth).toISOString() : null,
      open_date: account.open_date ? new Date(account.open_date).toISOString() : null,
      charge_off_date: account.charge_off_date ? new Date(account.charge_off_date).toISOString() : null,
      // Clean SSN format
      ssn: account.ssn?.replace(/[^0-9]/g, '').replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3'),
      // Clean state code
      state: account.state?.toUpperCase().substring(0, 2),
      // Clean zip code
      zip_code: account.zip_code?.replace(/[^0-9-]/g, '').substring(0, 10),
      // Clean email
      email: account.email?.toLowerCase().trim(),
      // Ensure account number
      account_number: account.account_number || `ACC-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));

    // Insert accounts
    const { data: insertedAccounts, error: accountError } = await supabase
      .from('accounts')
      .insert(cleanedAccounts)
      .select();

    if (accountError) throw accountError;

    // Process phone numbers
    if (insertedAccounts) {
      const phoneInserts = insertedAccounts.flatMap(account => {
        const numbers = phoneNumbers[account.account_number] || [];
        return numbers.map(number => ({
          account_id: account.id,
          number: number.replace(/[^0-9]/g, ''),
          status: 'unknown'
        }));
      });

      if (phoneInserts.length > 0) {
        const { error: phoneError } = await supabase
          .from('phone_numbers')
          .insert(phoneInserts);

        if (phoneError) throw phoneError;
      }
    }

    return insertedAccounts;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};