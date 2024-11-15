export interface AuthData {
  isLoggedIn: boolean;
  email?: string;
  rememberMe?: boolean;
  role?: 'site_admin' | 'crm_admin' | 'client_admin' | 'client_user';
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'site_admin' | 'crm_admin' | 'client_admin' | 'client_user';
  created_at: string;
  updated_at: string;
}