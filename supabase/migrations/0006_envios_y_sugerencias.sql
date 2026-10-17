-- Envíos de documentos a la dirección del máster y sugerencias de mejora.
--
-- Dos botones nuevos, con cuenta o sin ella:
--   · «Enviar a la dirección del máster», al final de cada hoja de IA-Lab.
--     El alumno escribe su nombre y su correo y pulsa: el documento llega a
--     la dirección, con el correo del alumno como Reply-To.
--   · «¿Algo se puede mejorar?», en el pie de todas las páginas. Texto, la
--     página desde la que se escribe y, si quiere, un correo para contestar.
--
-- Los dos salen por Postmark con los mismos secretos que los avisos
-- (postmark_token y postmark_from, en Vault). Sin secretos no se envía nada,
-- pero lo escrito queda guardado y se ve en el panel.
--
-- Nadie lee estas tablas por la API: se escribe por función y se lee desde
-- el panel, que solo abre el administrador.

create extension if not exists pg_net;

create table if not exists public.envio (
  id        bigint generated always as identity primary key,
  creado    timestamptz not null default now(),
  hoja      text not null check (hoja ~ '^[a-z0-9-]{1,24}$'),
  nombre    text not null check (char_length(nombre) between 1 and 120),
  correo    text not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(correo) <= 200),
  texto     text not null check (char_length(texto) between 1 and 60000),
  peticion  bigint
);
alter table public.envio enable row level security;
revoke all on public.envio from anon, authenticated;

create table if not exists public.sugerencia (
  id        bigint generated always as identity primary key,
  creado    timestamptz not null default now(),
  pagina    text check (pagina is null or char_length(pagina) <= 200),
  texto     text not null check (char_length(texto) between 1 and 2000),
  correo    text check (correo is null or (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(correo) <= 200)),
  peticion  bigint
);
alter table public.sugerencia enable row level security;
revoke all on public.sugerencia from anon, authenticated;

-- A quién llega. Una sola dirección, aquí y en ningún otro sitio.
create or replace function public._destino_direccion() returns text
language sql immutable as $$ select 'albert.garcia@bsm.upf.edu'::text $$;

-- Un correo por Postmark. Devuelve el id de la petición de pg_net, o null si
-- faltan los secretos.
create or replace function public._postmark(p_asunto text, p_cuerpo text, p_responder text)
returns bigint
language plpgsql security definer set search_path = public as $$
declare
  token text;
  desde text;
  cab   jsonb;
  pet   bigint;
begin
  select decrypted_secret into token from vault.decrypted_secrets where name = 'postmark_token';
  select decrypted_secret into desde from vault.decrypted_secrets where name = 'postmark_from';
  if token is null or desde is null then
    return null;
  end if;
  cab := jsonb_build_object(
    'From', desde,
    'To', public._destino_direccion(),
    'Subject', left(p_asunto, 180),
    'TextBody', p_cuerpo,
    'MessageStream', 'outbound');
  if p_responder is not null then
    cab := cab || jsonb_build_object('ReplyTo', p_responder);
  end if;
  select net.http_post(
    url := 'https://api.postmarkapp.com/email',
    headers := jsonb_build_object(
      'Accept', 'application/json',
      'Content-Type', 'application/json',
      'X-Postmark-Server-Token', token),
    body := cab
  ) into pet;
  return pet;
end $$;

-- «Enviar a la dirección del máster». Límite contra abusos: como mucho 5
-- envíos por correo y 40 en total cada diez minutos.
create or replace function public.enviar_documento(p_hoja text, p_titulo text, p_nombre text, p_correo text, p_texto text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  nid bigint;
  pet bigint;
  n   text := btrim(coalesce(p_nombre, ''));
  c   text := lower(btrim(coalesce(p_correo, '')));
begin
  if (select count(*) from envio where creado > now() - interval '10 minutes') >= 40
     or (select count(*) from envio where correo = c and creado > now() - interval '10 minutes') >= 5 then
    raise exception 'demasiados envíos, prueba en unos minutos' using errcode = 'P0001';
  end if;
  insert into envio (hoja, nombre, correo, texto) values (p_hoja, n, c, p_texto) returning id into nid;
  pet := public._postmark(
    'IA-Lab · ' || left(coalesce(nullif(btrim(p_titulo), ''), 'Documento'), 80) || ' · ' || n,
    'Enviado desde guia.qtorb.com por ' || n || ' (' || c || ').' || E'\n'
      || 'Para contestar, responde a este correo.' || E'\n\n'
      || p_texto,
    c);
  update envio set peticion = pet where id = nid;
end $$;

-- «¿Algo se puede mejorar?». Como mucho 30 cada diez minutos en total.
create or replace function public.enviar_sugerencia(p_pagina text, p_texto text, p_correo text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  nid bigint;
  pet bigint;
  c   text := nullif(lower(btrim(coalesce(p_correo, ''))), '');
  t   text := btrim(coalesce(p_texto, ''));
begin
  if (select count(*) from sugerencia where creado > now() - interval '10 minutes') >= 30 then
    raise exception 'demasiadas sugerencias, prueba en unos minutos' using errcode = 'P0001';
  end if;
  insert into sugerencia (pagina, texto, correo) values (left(p_pagina, 200), t, c) returning id into nid;
  pet := public._postmark(
    'Guía AI-First · sugerencia de mejora',
    'Página: ' || coalesce(p_pagina, '—') || E'\n'
      || 'Correo para contestar: ' || coalesce(c, 'no lo ha dejado') || E'\n\n'
      || t,
    c);
  update sugerencia set peticion = pet where id = nid;
end $$;

-- Lo que ve el panel.
create or replace function public.panel_sugerencias()
returns table (creado timestamptz, pagina text, texto text, correo text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public._es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  return query select s.creado, s.pagina, s.texto, s.correo from sugerencia s order by s.creado desc limit 500;
end $$;

create or replace function public.panel_envios()
returns table (creado timestamptz, hoja text, nombre text, correo text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public._es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  return query select e.creado, e.hoja, e.nombre, e.correo from envio e order by e.creado desc limit 500;
end $$;

revoke all on function public._destino_direccion() from public, anon, authenticated;
revoke all on function public._postmark(text, text, text) from public, anon, authenticated;
revoke all on function public.enviar_documento(text, text, text, text, text) from public;
revoke all on function public.enviar_sugerencia(text, text, text) from public;
revoke all on function public.panel_sugerencias() from public, anon;
revoke all on function public.panel_envios() from public, anon;
grant execute on function public.enviar_documento(text, text, text, text, text) to anon, authenticated;
grant execute on function public.enviar_sugerencia(text, text, text) to anon, authenticated;
grant execute on function public.panel_sugerencias() to authenticated;
grant execute on function public.panel_envios() to authenticated;
