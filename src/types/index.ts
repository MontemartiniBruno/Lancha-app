export type User = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type CommonAccount = {
  id: string;
  holder_name: string;
  cvu_alias: string;
  updated_at: string;
};

export type Transfer = {
  id: string;
  user_id: string;
  amount: number;
  transfer_date: string; // ISO date
  notes?: string;
  created_at: string;
};

export type Expense = {
  id: string;
  concept: string;
  amount: number;
  expense_date: string; // ISO date
  notes?: string;
  created_at: string;
};

export type TurnType = 'private' | 'shared';

export type Turn = {
  id: string;
  turn_date: string; // ISO date
  type: TurnType;
  assigned_to: string | null;
  notes?: string;
  created_at: string;
};

export type Movement = {
  id: string;
  type: 'transfer' | 'expense';
  date: string;
  description: string;
  amount: number;
  created_at: string;
};

export type UserBalance = {
  id: string;
  name: string;
  total_transferred: number;
  balance: number; // Negativo = debe, Positivo = adelantó
};
