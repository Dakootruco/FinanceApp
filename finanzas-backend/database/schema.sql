-- Eliminar tablas si existen (para reinicio limpio en desarrollo)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

-- Tabla de Categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')), -- 'income' (ingreso) o 'expense' (gasto)
    icon VARCHAR(50), -- Nombre de icono opcional (e.g. 'food', 'car')
    color VARCHAR(20) DEFAULT '#cccccc', -- Color hexadecimal para gráficos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Transacciones
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Semilla de Categorías Predeterminadas
-- Ingresos
INSERT INTO categories (name, type, icon, color) VALUES
('Salario', 'income', 'briefcase', '#10B981'),
('Inversiones', 'income', 'trending-up', '#3B82F6'),
('Ventas / Freelance', 'income', 'credit-card', '#6366F1'),
('Otros Ingresos', 'income', 'plus-circle', '#8B5CF6');

-- Gastos
INSERT INTO categories (name, type, icon, color) VALUES
('Comida / Supermercado', 'expense', 'shopping-bag', '#EF4444'),
('Transporte', 'expense', 'truck', '#F59E0B'),
('Vivienda / Alquiler', 'expense', 'home', '#10B981'),
('Servicios (Luz, Agua, Internet)', 'expense', 'zap', '#06B6D4'),
('Salud', 'expense', 'heart', '#EC4899'),
('Entretenimiento / Ocio', 'expense', 'film', '#F43F5E'),
('Educación', 'expense', 'book-open', '#14B8A6'),
('Otros Gastos', 'expense', 'minus-circle', '#6B7280');
