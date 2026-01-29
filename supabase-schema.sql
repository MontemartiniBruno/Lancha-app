-- Schema SQL para Supabase
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuarios iniciales (Franco, Renzo, Bruno)
-- Nota: En producción, las contraseñas deben estar hasheadas con bcrypt
-- Por ahora, se pueden establecer manualmente en Supabase o usar el valor directo para desarrollo
INSERT INTO users (name, email, password_hash) VALUES
  ('Franco', 'franco@example.com', 'franco123'),
  ('Renzo', 'renzo@example.com', 'renzo123'),
  ('Bruno', 'bruno@example.com', 'bruno123')
ON CONFLICT (email) DO NOTHING;

-- Tabla de cuenta común
CREATE TABLE IF NOT EXISTS common_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_name TEXT DEFAULT '',
  cvu_alias TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar cuenta común inicial
INSERT INTO common_account (holder_name, cvu_alias) VALUES
  ('', '')
ON CONFLICT DO NOTHING;

-- Tabla de transferencias (usuarios -> cuenta común)
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  transfer_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos (cuenta común -> fuera)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('private', 'shared')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turn_date)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_turns_date ON turns(turn_date);
CREATE INDEX IF NOT EXISTS idx_turns_assigned ON turns(assigned_to);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE turns ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir todo para anónimos (MVP sin auth avanzada)
-- En producción, deberías usar políticas más restrictivas
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for common_account" ON common_account FOR ALL USING (true);
CREATE POLICY "Allow all for transfers" ON transfers FOR ALL USING (true);
CREATE POLICY "Allow all for expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all for turns" ON turns FOR ALL USING (true);
