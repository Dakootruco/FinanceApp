-- Modificar la restricción de cuenta bancaria única para que sea por combinación de nombre y usuario
ALTER TABLE public.bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_name_key;
ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_name_user_id_key UNIQUE(name, user_id);
