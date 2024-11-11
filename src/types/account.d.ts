export interface Account {
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
  phone_numbers?: PhoneNumber[];
}

export interface PhoneNumber {
  id: string;
  account_id: string;
  number: string;
  status: 'good' | 'bad' | 'unknown';
  last_called?: string;
  created_at: string;
  updated_at: string;
}

export interface CallRecord {
  id: string;
  accountId: string;
  collectorId: string;
  startTime: string;
  duration: number;
  status: 'completed' | 'no_answer' | 'voicemail' | 'failed';
  recording?: string;
  summary: string;
  nextActionDate: string;
  nextAction: string;
}