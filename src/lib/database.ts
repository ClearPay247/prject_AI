import { supabase } from './supabase';
import { Account, PhoneNumber } from '../types/account';
import { Payment } from '../types/payment';
import { BlandSettings } from '../types/bland';

export interface CallLog {
  account_id: string;
  phone_number: string;
  status: 'completed' | 'no_answer' | 'voicemail' | 'failed';
  duration?: number;
  recording_url?: string;
  transcript?: string;
  bland_call_id?: string;
  voice_used?: string;
  from_number?: string;
}

export interface CallRule {
  id: string;
  rule_text: string;
  is_implemented: boolean;
  created_at: string;
}

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
  },

  async clearNewRules() {
    try {
      const { error } = await supabase
        .from('call_rules')
        .delete()
        .eq('is_implemented', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to clear new rules:', error);
      return false;
    }
  }
};

export const callLogsService = {
  async addCallLog(log: CallLog) {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .insert({
          account_id: log.account_id,
          phone_number: log.phone_number,
          status: log.status,
          duration: log.duration,
          recording_url: log.recording_url,
          transcript: log.transcript,
          bland_call_id: log.bland_call_id,
          voice_used: log.voice_used,
          from_number: log.from_number,
          call_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to add call log:', error);
      throw error;
    }
  },

  async getCallLogs() {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select(`
          *,
          account:accounts(
            account_number,
            debtor_name
          )
        `)
        .order('call_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch call logs:', error);
      throw error;
    }
  }
};

export const accountService = {
  async batchImportAccounts(accounts: Partial<Account>[], phoneNumbers: Record<string, string[]>) {
    try {
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert(accounts.map(account => ({
          account_number: account.account_number || `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          original_account_number: account.original_account_number,
          debtor_name: account.debtor_name,
          address: account.address,
          city: account.city,
          state: account.state,
          zip_code: account.zip_code,
          ssn: account.ssn,
          date_of_birth: account.date_of_birth,
          email: account.email,
          current_balance: account.current_balance,
          original_creditor: account.original_creditor,
          status: 'new',
          add_date: new Date().toISOString(),
          add_notes: account.add_notes
        })))
        .select();

      if (accountError) throw accountError;

      if (accountData) {
        const phoneNumberInserts = accountData.flatMap(account => {
          const numbers = phoneNumbers[account.account_number] || [];
          return numbers.map(number => ({
            account_id: account.id,
            number: number,
            status: 'unknown'
          }));
        });

        if (phoneNumberInserts.length > 0) {
          const { error: phoneError } = await supabase
            .from('phone_numbers')
            .insert(phoneNumberInserts);

          if (phoneError) throw phoneError;
        }
      }

      return accountData;
    } catch (error) {
      console.error('Failed to batch import accounts:', error);
      throw error;
    }
  },

  async getAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          phone_numbers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  }
};

export const integrationService = {
  async getBlandSettings(): Promise<BlandSettings | null> {
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

  async saveBlandSettings(settings: BlandSettings): Promise<boolean> {
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

export const paymentService = {
  async getPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },

  async addPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to add payment:', error);
      return null;
    }
  },

  async updatePaymentStatus(id: string, status: 'pending' | 'processed' | 'declined') {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  }
};

export const initializeDatabase = async () => {
  try {
    // Create call_logs table if it doesn't exist
    const { error: callLogsError } = await supabase.from('call_logs').select('id').limit(1);
    if (callLogsError?.code === '42P01') {
      const { error } = await supabase.rpc('exec', {
        query: `
          create table if not exists call_logs (
            id uuid default gen_random_uuid() primary key,
            account_id uuid references accounts(id) on delete set null,
            phone_number text not null,
            call_time timestamp with time zone default now(),
            duration integer,
            status text not null check (status in ('completed', 'no_answer', 'voicemail', 'failed')),
            recording_url text,
            transcript text,
            bland_call_id text,
            voice_used text,
            from_number text,
            created_at timestamp with time zone default now(),
            updated_at timestamp with time zone default now()
          );
          create index if not exists idx_call_logs_account on call_logs(account_id);
          create index if not exists idx_call_logs_status on call_logs(status);
          create index if not exists idx_call_logs_call_time on call_logs(call_time);
        `
      });
      if (error) console.error('Error creating call_logs table:', error);
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('count')
      .single();
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to test database connection:', error);
    return false;
  }
};