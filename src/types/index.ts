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
  user_id: string | null;        // Ahora puede ser null
  custom_name: string | null;     // NUEVO
  amount: number;
  transfer_date: string; // ISO date
  notes?: string;
  receipt_url?: string;           // NUEVO
  created_at: string;
};

export type Expense = {
  id: string;
  concept: string;
  amount: number;
  expense_date: string; // ISO date
  notes?: string;
  receipt_url?: string;           // NUEVO
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
  receipt_url?: string;
  notes?: string;
  created_at: string;
};

export type UserBalance = {
  id: string;
  name: string;
  total_transferred: number;
  balance: number; // Negativo = debe, Positivo = adelantó
};

// NUEVO: BoatInfo type
export type BoatInfo = {
  id: number;
  model: string;
  motor: string;
  matricula: string;
  last_service: string;
  next_service: string;
  updated_at: string;
};
