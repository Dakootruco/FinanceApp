-- 1. Agregar columna username a la tabla public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 2. Actualizar la función handle_new_user() para guardar el username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, username)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Usuario'),
        new.email,
        LOWER(COALESCE(new.raw_user_meta_data->>'username', ''))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
