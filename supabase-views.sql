-- Vistas del esquema de Supabase
-- Ejecutar en SQL Editor (necesario en todos los proyectos: dev y prod)

-- Vista: balance de la cuenta común
CREATE OR REPLACE VIEW common_balance AS
SELECT
  (SELECT COALESCE(SUM(amount), 0) FROM transfers) -
  (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS balance;

-- Vista: balance por usuario (cuánto aportó cada uno vs. su cuota proporcional de gastos)
CREATE OR REPLACE VIEW user_balances AS
SELECT
  u.id,
  u.name,
  COALESCE(SUM(t.amount), 0) AS total_transferred,
  COALESCE(SUM(t.amount), 0) - (
    (SELECT COALESCE(SUM(amount), 0) FROM expenses) /
    NULLIF((SELECT COUNT(*) FROM users), 0)
  ) AS balance
FROM users u
LEFT JOIN transfers t ON t.user_id = u.id
GROUP BY u.id, u.name;
