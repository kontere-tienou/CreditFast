export type UserRole = 'client' | 'credit_agent' | 'analyst' | 'committee_member' | 'admin';

export type ApiErrorBody = {
  message: string;
  errors?: Record<string, string[]>;
};
