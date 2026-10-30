create or replace function public.block_signup_if_owner_exists()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from auth.users) > 0 then
    raise exception 'Sign up is closed: the owner account already exists.';
  end if;
  return new;
end;
$$;

create trigger enforce_single_owner_signup
before insert on auth.users
for each row
execute function public.block_signup_if_owner_exists();

create or replace function public.signup_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (select count(*) from auth.users) = 0;
$$;

grant execute on function public.signup_open() to anon, authenticated;