-- Agregar campo MATRICULA a la tabla boat_info
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Agregar columna matricula a boat_info
ALTER TABLE boat_info 
  ADD COLUMN IF NOT EXISTS matricula TEXT DEFAULT '';

-- 2. Actualizar el registro existente (si existe) con un valor por defecto
UPDATE boat_info 
SET matricula = '' 
WHERE matricula IS NULL;

-- 3. (Opcional) Si quieres establecer un valor inicial específico:
-- UPDATE boat_info 
-- SET matricula = 'ABC-1234' 
-- WHERE id = 1 AND (matricula = '' OR matricula IS NULL);
