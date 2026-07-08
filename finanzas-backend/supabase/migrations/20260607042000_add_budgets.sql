-- Tabla de Presupuestos
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE UNIQUE,
    limit_amount DECIMAL(12, 2) NOT NULL CHECK (limit_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Semilla de límites iniciales para las categorías existentes
INSERT INTO budgets (category_id, limit_amount)
SELECT id, 10000.00 FROM categories WHERE name = 'Comida / Supermercado' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 1500.00 FROM categories WHERE name = 'Transporte' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 25000.00 FROM categories WHERE name = 'Vivienda / Alquiler' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 5000.00 FROM categories WHERE name = 'Servicios (Luz, Agua, Internet)' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 3000.00 FROM categories WHERE name = 'Salud' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 4000.00 FROM categories WHERE name = 'Entretenimiento / Ocio' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 5000.00 FROM categories WHERE name = 'Educación' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO budgets (category_id, limit_amount)
SELECT id, 2000.00 FROM categories WHERE name = 'Otros Gastos' AND type = 'expense'
ON CONFLICT (category_id) DO NOTHING;
