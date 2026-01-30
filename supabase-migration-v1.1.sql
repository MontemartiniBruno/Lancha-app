-- Migración v1.1 - Nuevos campos y tablas
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- 1. Agregar campos nuevos a transfers
ALTER TABLE transfers 
  ADD COLUMN IF NOT EXISTS custom_name TEXT,
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Modificar user_id para permitir NULL (para usuarios "Otros")
ALTER TABLE transfers 
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Agregar campo receipt_url a expenses
ALTER TABLE expenses 
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 3. Crear tabla boat_info
CREATE TABLE IF NOT EXISTS boat_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  model TEXT NOT NULL DEFAULT 'Cargo 520 2024',
  motor TEXT NOT NULL DEFAULT 'Mercury 60 4t',
  last_service TEXT DEFAULT '02/2026',
  next_service TEXT DEFAULT '02/2027',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales si no existen
INSERT INTO boat_info (id, model, motor, last_service, next_service)
VALUES (1, 'Cargo 520 2024', 'Mercury 60 4t', '02/2026', '02/2027')
ON CONFLICT (id) DO NOTHING;

-- 4. Crear bucket de storage para comprobantes (ejecutar en Storage de Supabase)
-- Nota: Esto debe hacerse manualmente en la interfaz de Supabase:
-- 1. Ve a Storage en el dashboard
-- 2. Crea un nuevo bucket llamado "receipts"
-- 3. Configura las políticas de acceso según necesites

-- 5. Política RLS para boat_info (si usas RLS)
ALTER TABLE boat_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for boat_info" ON boat_info FOR ALL USING (true);

-- 6. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_transfers_custom_name ON transfers(custom_name);
CREATE INDEX IF NOT EXISTS idx_transfers_receipt_url ON transfers(receipt_url);
CREATE INDEX IF NOT EXISTS idx_expenses_receipt_url ON expenses(receipt_url);
