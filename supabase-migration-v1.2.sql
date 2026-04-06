-- Migration v1.2: Gastos Recurrentes
-- Ejecutar en SQL Editor de Supabase (dev y prod por separado)

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  amount           DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  frequency_type   TEXT NOT NULL CHECK (frequency_type IN ('monthly', 'annual', 'custom')),
  frequency_months INTEGER,           -- NULL para monthly; 12 para annual; N para custom
  next_due_date    DATE,              -- NULL para items puramente mensuales (ej: guardería)
  last_done_date   DATE,              -- cuándo fue ejecutado por última vez
  notes            TEXT,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (igual que resto de tablas en el proyecto)
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for recurring_expenses" ON recurring_expenses
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_recurring_expenses_active
  ON recurring_expenses(active, sort_order);

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_recurring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_expenses_updated_at
  BEFORE UPDATE ON recurring_expenses
  FOR EACH ROW EXECUTE FUNCTION update_recurring_updated_at();

-- Datos iniciales
INSERT INTO recurring_expenses (name, amount, frequency_type, frequency_months, notes, sort_order)
VALUES
  ('Guardería', 250000, 'monthly', NULL, 'Cuota mensual de guardería', 1),
  ('Service', 0, 'custom', 12, 'Service del motor. Actualizar monto y fecha cuando corresponda.', 2),
  ('Cambio matafuegos', 0, 'custom', 24, 'Reemplazo bianual de matafuegos', 3)
ON CONFLICT DO NOTHING;
