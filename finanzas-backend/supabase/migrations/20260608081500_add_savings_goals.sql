-- Tabla de Planes de Ahorro (Objetivos de Ahorro)
CREATE TABLE IF NOT EXISTS savings_goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount >= 0),
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    color_theme VARCHAR(30) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Semilla inicial de planes de ahorro para que coincida con el diseño original del Dashboard
INSERT INTO savings_goals (name, target_amount, current_amount, color_theme) VALUES
('Fondo de Emergencia', 10000.00, 4500.00, '#6366f1'),
('Fondo de Retiro', 20000.00, 5000.00, '#72a5e4'),
('Fondo de Vacaciones', 5000.00, 2500.00, '#10b981');
