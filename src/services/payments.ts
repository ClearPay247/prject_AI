import { supabase } from '../lib/supabase';
import { encryptData } from '../utils/encryption';

export interface PaymentData {
  account_id: string;
  amount: number;
  payment_type: 'card' | 'check';
  payment_method: {
    card?: {
      number: string;
      expiry: string;
      cvv: string;
      name: string;
      zip: string;
    };
    check?: {
      routingNumber: string;
      accountNumber: string;
      accountType: 'checking' | 'savings';
      name: string;
    };
  };
  post_date?: string;
  payment_plan_type?: 'settlement' | 'payment_plan';
  monthly_payment?: number;
  total_payments?: number;
  savings_amount?: number;
  original_balance?: number;
  settlement_percentage?: number;
}

export const paymentsService = {
  async addPayment(payment: PaymentData): Promise<boolean> {
    try {
      // Encrypt payment method details
      const encryptedPaymentMethod = encryptData(JSON.stringify(payment.payment_method));

      const { data, error } = await supabase
        .from('payments')
        .insert({
          account_id: payment.account_id,
          amount: payment.amount,
          payment_type: payment.payment_type,
          payment_method_encrypted: encryptedPaymentMethod,
          post_date: payment.post_date,
          payment_plan_type: payment.payment_plan_type || 'settlement',
          monthly_payment: payment.monthly_payment,
          total_payments: payment.total_payments,
          savings_amount: payment.savings_amount,
          original_balance: payment.original_balance,
          settlement_percentage: payment.settlement_percentage,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to add payment:', error);
      throw error;
    }
  },

  async getPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          accounts (
            debtor_name,
            account_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },

  async updatePaymentStatus(id: string, status: 'processed' | 'declined'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  }
};