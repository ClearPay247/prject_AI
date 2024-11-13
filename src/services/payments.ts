import { supabase } from '../lib/supabase';
import { encryptData, decryptData } from '../utils/encryption';
import { Payment } from '../types/payment';

export const paymentsService = {
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Encrypt sensitive payment details
      const sensitiveData = payment.payment_type === 'card' ? payment.payment_method.card : payment.payment_method.check;
      const encryptedDetails = await encryptData(JSON.stringify(sensitiveData));

      const { data, error } = await supabase
        .from('payments')
        .insert({
          account_id: payment.account_id,
          amount: payment.amount,
          payment_type: payment.payment_type,
          payment_method_encrypted: encryptedDetails,
          status: 'pending',
          post_date: payment.post_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  },

  async getPayments(): Promise<Payment[]> {
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

  async getDecryptedPaymentDetails(payment: Payment): Promise<any> {
    try {
      if (!payment.payment_method) return null;
      
      const decryptedData = await decryptData(payment.payment_method_encrypted);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt payment details:', error);
      return null;
    }
  },

  async updatePaymentStatus(paymentId: string, status: 'processed' | 'declined'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }
};