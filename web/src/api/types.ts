export type ApiRole = 'client' | 'credit_agent' | 'analyst' | 'committee_member' | 'admin';

export type ApiUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  role: ApiRole | string;
  created_at?: string;
};

export type AuthTokenResponse = {
  message?: string;
  token: string;
  user: ApiUser;
};

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};
