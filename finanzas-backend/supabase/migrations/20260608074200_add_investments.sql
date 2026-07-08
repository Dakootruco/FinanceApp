-- Tabla de Inversiones
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Bolsa', 'Cripto', 'Bienes Raíces', 'Fondo Mutuo', 'Renta Fija', 'Otros')),
    amount_invested DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_invested >= 0),
    change_percentage DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Semilla de inversiones iniciales
INSERT INTO investments (name, category, amount_invested, change_percentage) VALUES
('Acciones de Apple (AAPL)', 'Bolsa', 1500.00, 12.50),
('Bitcoin (BTC)', 'Cripto', 3500.00, 28.30),
('Fondo de Renta Fija Gubernamental', 'Renta Fija', 5000.00, 4.20),
('ETF S&P 500 (VOO)', 'Bolsa', 2000.00, -2.10);
