export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          account_number: string;
          original_account_number?: string;
          debtor_name: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          ssn?: string;
          date_of_birth?: string;
          email?: string;
          current_balance?: number;
          original_creditor?: string;
          status: string;
          add_date: string;
          add_notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_number: string;
          original_account_number?: string;
          debtor_name: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          ssn?: string;
          date_of_birth?: string;
          email?: string;
          current_balance?: number;
          original_creditor?: string;
          status?: string;
          add_date?: string;
          add_notes?: string;
        };
        Update: {
          id?: string;
          account_number?: string;
          original_account_number?: string;
          debtor_name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          ssn?: string;
          date_of_birth?: string;
          email?: string;
          current_balance?: number;
          original_creditor?: string;
          status?: string;
          add_date?: string;
          add_notes?: string;
        };
      };
      phone_numbers: {
        Row: {
          id: string;
          account_id: string;
          number: string;
          status: string;
          last_called?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          number: string;
          status?: string;
          last_called?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          number?: string;
          status?: string;
          last_called?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          account_id: string;
          amount: number;
          payment_type: 'card' | 'check';
          payment_method_encrypted: string;
          status: 'pending' | 'processed' | 'declined';
          post_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          amount: number;
          payment_type: 'card' | 'check';
          payment_method_encrypted: string;
          status?: 'pending' | 'processed' | 'declined';
          post_date?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          amount?: number;
          payment_type?: 'card' | 'check';
          payment_method_encrypted?: string;
          status?: 'pending' | 'processed' | 'declined';
          post_date?: string;
        };
      };
      integration_settings: {
        Row: {
          id: string;
          provider: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          settings: Record<string, any>;
        };
        Update: {
          id?: string;
          provider?: string;
          settings?: Record<string, any>;
        };
      };
    };
  };
}