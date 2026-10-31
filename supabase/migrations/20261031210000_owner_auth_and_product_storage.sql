CREATE OR REPLACE FUNCTION public.block_signup_if_owner_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users) THEN
    RAISE EXCEPTION 'Sign up is closed: the owner account already exists.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_single_owner_signup ON auth.users;

CREATE TRIGGER enforce_single_owner_signup
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.block_signup_if_owner_exists();

CREATE OR REPLACE FUNCTION public.signup_open()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM auth.users);
$$;

GRANT EXECUTE ON FUNCTION public.signup_open() TO anon, authenticated;

INSERT INTO storage.buckets
(id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
