-- Tabla de Tarjetas de Crédito
CREATE TABLE IF NOT EXISTS credit_cards (
    id SERIAL PRIMARY KEY,
    card_name VARCHAR(100) NOT NULL,
    bank VARCHAR(100) NOT NULL,
    brand VARCHAR(20) NOT NULL CHECK (brand IN ('Visa', 'Mastercard', 'American Express', 'Otro')),
    last_digits VARCHAR(4) NOT NULL CHECK (length(last_digits) = 4),
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    color_theme VARCHAR(30) DEFAULT '#121620',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Semilla de tarjetas iniciales para coincidir con el diseño actual
INSERT INTO credit_cards (card_name, bank, brand, last_digits, balance, color_theme) VALUES
('Visa Platinum Plus', 'Visa Bank', 'Visa', '9967', 415000.00, '#121620'),
('Mastercard Freedom Unlimited', 'MC Bank', 'Mastercard', '5487', 532000.00, '#1b2535');
