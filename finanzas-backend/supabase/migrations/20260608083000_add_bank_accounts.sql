-- Tabla de Cuentas Bancarias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    bank_name VARCHAR(100) NOT NULL,
    last_digits VARCHAR(4) NOT NULL CHECK (length(last_digits) = 4),
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar relación en la tabla de transacciones
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Función para actualizar el saldo de la cuenta bancaria de forma automática
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Manejo del INSERT
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.bank_account_id IS NOT NULL) THEN
            IF (NEW.type = 'income') THEN
                UPDATE bank_accounts 
                SET balance = balance + NEW.amount 
                WHERE id = NEW.bank_account_id;
            ELSIF (NEW.type = 'expense') THEN
                UPDATE bank_accounts 
                SET balance = balance - NEW.amount 
                WHERE id = NEW.bank_account_id;
            END IF;
        END IF;
        
    -- Manejo del DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.bank_account_id IS NOT NULL) THEN
            IF (OLD.type = 'income') THEN
                UPDATE bank_accounts 
                SET balance = balance - OLD.amount 
                WHERE id = OLD.bank_account_id;
            ELSIF (OLD.type = 'expense') THEN
                UPDATE bank_accounts 
                SET balance = balance + OLD.amount 
                WHERE id = OLD.bank_account_id;
            END IF;
        END IF;
        
    -- Manejo del UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Si cambió la cuenta o el monto o el tipo de movimiento
        IF (COALESCE(OLD.bank_account_id, 0) <> COALESCE(NEW.bank_account_id, 0) OR OLD.amount <> NEW.amount OR OLD.type <> NEW.type) THEN
            -- Revertir el efecto en la cuenta anterior
            IF (OLD.bank_account_id IS NOT NULL) THEN
                IF (OLD.type = 'income') THEN
                    UPDATE bank_accounts SET balance = balance - OLD.amount WHERE id = OLD.bank_account_id;
                ELSIF (OLD.type = 'expense') THEN
                    UPDATE bank_accounts SET balance = balance + OLD.amount WHERE id = OLD.bank_account_id;
                END IF;
            END IF;
            
            -- Aplicar el efecto en la cuenta nueva
            IF (NEW.bank_account_id IS NOT NULL) THEN
                IF (NEW.type = 'income') THEN
                    UPDATE bank_accounts SET balance = balance + NEW.amount WHERE id = NEW.bank_account_id;
                ELSIF (NEW.type = 'expense') THEN
                    UPDATE bank_accounts SET balance = balance - NEW.amount WHERE id = NEW.bank_account_id;
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Eliminar el trigger si ya existe para evitar errores de duplicidad
DROP TRIGGER IF EXISTS trg_update_bank_account_balance ON transactions;

-- Crear el disparador asociado
CREATE TRIGGER trg_update_bank_account_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_bank_account_balance();

-- Semilla inicial de cuentas bancarias
INSERT INTO bank_accounts (name, bank_name, last_digits, balance) VALUES
('Cuenta Ahorros Popular', 'Banco Popular', '1234', 125500.00),
('Cuenta Corriente BHD', 'Banco BHD', '5678', 48200.00)
ON CONFLICT (name) DO NOTHING;
