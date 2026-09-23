-- Panel de actividad (solo el administrador) y botón «Me he atascado aquí».
--
-- Decidido por Albert el 23-09-2026 (claude/Propuesta_backoffice_actividad.md).
-- Dos promesas públicas marcan lo que este fichero puede y no puede hacer:
--
--   · «No leo lo que escribes». Por eso las funciones del panel NO devuelven
--     nunca el contenido de las hojas: sacan del JSON solo el paso, el total y
--     si la hoja está terminada. El panel no puede enseñar lo que no recibe.
--   · «No se guarda cuándo entras». Por eso no se usa last_sign_in_at, aunque
--     Supabase lo tenga. La «última actividad» es la fecha de la última copia
--     guardada (dossier.actualizado), que la página de privacidad ya menciona.
--
-- Se aplica a mano desde el SQL Editor de Supabase, igual que 0001.

-- Utilidades: convertir sin romper. Un dossier viejo o mal formado no puede
-- tumbar el panel entero; lo que no se entiende vale null.
create or replace function public._jsonb_o_null(t text) returns jsonb
language plpgsql immutable as $$
begin
  if t is null then return null; end if;
  return t::jsonb;
exception when others then
  return null;
end $$;

create or replace function public._int_o_null(t text) returns int
language plpgsql immutable as $$
begin
  if t is null then return null; end if;
  return round(t::numeric)::int;
exception when others then
  return null;
end $$;

-- Quién es el administrador. Una sola cuenta, con el correo confirmado.
-- La comprobación la hace el servidor: conocer la dirección /panel no da nada.
create or replace function public._es_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) = 'albert@qtorb.com'
      and u.email_confirmed_at is not null
  );
$$;

-- Una fila por cuenta. Solo metadatos: nunca lo escrito.
create or replace function public.panel_personas()
returns table (
  correo text,
  nombre text,
  via text,
  alta timestamptz,
  ultima_actividad timestamptz,
  hojas jsonb,          -- { "<n>": { "paso": int, "total": int, "fin": bool } }
  metodo_paso int,      -- paso alcanzado en el recorrido (1..7) o null
  plan30 boolean        -- ha empezado el plan de 30 días
)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public._es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  return query
  with d as (
    select
      x.user_id,
      x.actualizado,
      public._jsonb_o_null(x.datos->>'ialab-dossier-v2') as ia,
      public._jsonb_o_null(x.datos->>'metodo-ai-first')  as me,
      public._jsonb_o_null(x.datos->>'metodo-plan30')    as p30
    from public.dossier x
  )
  select
    u.email::text,
    coalesce(u.raw_user_meta_data->>'full_name',
             u.raw_user_meta_data->>'name',
             u.raw_user_meta_data->>'user_name', '')::text,
    coalesce(u.raw_app_meta_data->>'provider', 'email')::text,
    u.created_at,
    d.actualizado,
    coalesce((
      select jsonb_object_agg(e.k, jsonb_build_object(
        'paso',  public._int_o_null(e.v->>'_paso'),
        'total', public._int_o_null(e.v->>'_total'),
        'fin',   (e.v ? '_fin')))
      from jsonb_each(
        case when jsonb_typeof(d.ia->'d'->'hojas') = 'object'
             then d.ia->'d'->'hojas' else '{}'::jsonb end) as e(k, v)
      where jsonb_typeof(e.v) = 'object'
    ), '{}'::jsonb),
    public._int_o_null(d.me->>'_paso'),
    coalesce(jsonb_typeof(d.p30) = 'object' and d.p30 <> '{}'::jsonb, false)
  from auth.users u
  left join d on d.user_id = u.id
  order by d.actualizado asc nulls first;
end $$;

-- El botón de atasco. Sin identidad: ni user_id, ni correo, ni IP.
create table if not exists public.atasco (
  id     bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  hoja   text not null check (hoja ~ '^[a-z0-9-]{1,24}$'),
  paso   int  not null check (paso between 1 and 60),
  frase  text check (frase is null or char_length(frase) <= 280)
);

alter table public.atasco enable row level security;

-- Cualquiera puede avisar, con cuenta o sin ella. Nadie puede leer por la
-- API: no hay política de lectura. El panel lee con la función de abajo.
drop policy if exists "cualquiera puede avisar" on public.atasco;
create policy "cualquiera puede avisar"
  on public.atasco for insert
  to anon, authenticated
  with check (true);

grant insert on public.atasco to anon, authenticated;

create or replace function public.panel_atascos()
returns table (creado timestamptz, hoja text, paso int, frase text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public._es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  return query
    select a.creado, a.hoja, a.paso, a.frase
    from public.atasco a
    order by a.creado desc
    limit 500;
end $$;

-- Permisos: las funciones del panel solo las puede llamar alguien con sesión,
-- y dentro comprueban que es el administrador.
revoke all on function public._es_admin()      from public, anon;
revoke all on function public.panel_personas() from public, anon;
revoke all on function public.panel_atascos()  from public, anon;
grant execute on function public._es_admin()      to authenticated;
grant execute on function public.panel_personas() to authenticated;
grant execute on function public.panel_atascos()  to authenticated;
