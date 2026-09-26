-- Los avisos de tu mes.
--
-- Quien tiene cuenta y lo pide recibe un correo el día que cierra cada una de
-- las cuatro semanas de su plan de 30 días, a la hora de su checkpoint, y
-- después uno al mes hasta que se dé de baja.
--
-- Los correos salen de aquí: pg_cron llama cada diez minutos a
-- enviar_avisos(), que manda por pg_net a la API de Postmark lo que toca. No
-- hay Edge Functions. Y la tarea programada nunca lee el dossier: los correos
-- llevan el texto general de cada semana y un enlace, nada de lo escrito.
--
-- Las fechas las calcula el navegador, que es donde vive el plan, y las
-- entrega por programar_avisos(). Aquí solo se guardan fechas y estados.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Quién ha pedido avisos. Una fila por persona. `baja` es el token del
-- enlace de baja de los correos: sirve sin sesión, y no dice quién eres.
create table if not exists public.aviso (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activo  boolean not null default true,
  baja    uuid not null default gen_random_uuid() unique,
  creado  timestamptz not null default now()
);

alter table public.aviso enable row level security;

drop policy if exists "ve el suyo" on public.aviso;
create policy "ve el suyo"
  on public.aviso for select
  to authenticated
  using (auth.uid() = user_id);

-- Borrar el suyo es lo que hace «Borrar mis datos», y arrastra los
-- recordatorios. Crear y cambiar van por las funciones de abajo.
drop policy if exists "borra el suyo" on public.aviso;
create policy "borra el suyo"
  on public.aviso for delete
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.aviso from anon;

-- Cada correo que toca mandar. 'semana' 1..4 y 'mes' 1, 2, 3…
create table if not exists public.recordatorio (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.aviso(user_id) on delete cascade,
  tipo       text not null check (tipo in ('semana', 'mes')),
  n          int  not null check (n between 1 and 600),
  envio_en   timestamptz not null,
  enviado_en timestamptz,
  estado     text not null default 'pendiente'
             check (estado in ('pendiente', 'enviado', 'error', 'caducado')),
  peticion   bigint,
  unique (user_id, tipo, n)
);

alter table public.recordatorio enable row level security;

drop policy if exists "ve los suyos" on public.recordatorio;
create policy "ve los suyos"
  on public.recordatorio for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.recordatorio from anon;

-- Los textos de los correos. Nadie los lee por la API: solo enviar_avisos().
create table if not exists public.aviso_texto (
  tipo   text,
  n      int,
  asunto text,
  cuerpo text,
  primary key (tipo, n)
);

alter table public.aviso_texto enable row level security;
revoke all on public.aviso_texto from anon, authenticated;

insert into public.aviso_texto (tipo, n, asunto, cuerpo) values
('semana', 1, 'Tu mes · semana 1: tres frases de alguien de fuera', $t$Hoy cierra la semana 1 de tu plan.

Lo que tendría que existir ya: tres frases literales de la persona con la que hablaste, apuntadas tal cual las dijo.

Si la conversación ya ha pasado, abre el texto «Cerrar la tanda» (en tu carpeta es textos/4_cerrar_la_tanda.md) y ciérrala con uno de los tres veredictos: aguanta, aguanta pero no como lo contabas, o se cae.

Si todavía no ha pasado, la semana 1 se alarga hasta contenerla. Lo que no se mueve es que ocurra.

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan. Para no recibir más: {url_baja}$t$),
('semana', 2, 'Tu mes · semana 2: una dirección que puedes mandar por WhatsApp', $t$Hoy cierra la semana 2 de tu plan.

Lo que tendría que existir ya: una dirección que se abre en un móvil y explica qué ofreces y a quién.

Antes de encargarla, tres líneas con lo que tiene que cumplir para que valga, y que una de ellas pueda fallar. El texto es «Escribir el encargo» (textos/1_escribir_el_encargo.md).

Si no está, muévela una semana. Lo que no se mueve es el orden: sin dirección no hay semana 3.

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan. Para no recibir más: {url_baja}$t$),
('semana', 3, 'Tu mes · semana 3: qué no se entiende sin ti delante', $t$Hoy cierra la semana 3 de tu plan.

Lo que tendría que existir ya: cinco personas de tu público han mirado la página, y tienes apuntado lo que dijo cada una.

Lo que más te va a servir es dónde no coinciden. Ciérralo con «Cerrar la tanda» (textos/4_cerrar_la_tanda.md).

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan. Para no recibir más: {url_baja}$t$),
('semana', 4, 'Tu mes · semana 4: fuera, y sabes qué mirar', $t$Hoy cierra tu mes.

Lo que tendría que existir ya: la página publicada, y escrito qué cambiaste por lo que te dijeron.

Y una comprobación que puedas hacer tú solo cada semana, sin preguntar a nadie. Para lo siguiente, «Abrir la siguiente tanda» (textos/4_cerrar_la_tanda.md).

A partir de aquí te escribo una vez al mes, con una sola pregunta.

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan. Para no recibir más: {url_baja}$t$),
('mes', 0, 'Tu mes · qué has cambiado por lo que te dijeron', $t$Ha pasado otro mes.

Una pregunta, y solo una: ¿qué has cambiado este mes por lo que te dijo alguien de fuera?

Si es algo, súmalo al contador de tu plan y abre la siguiente tanda con fecha.

Si es nada, no es un reproche: es la señal de que llevas un mes trabajando sin preguntar. Lo siguiente no es otro documento, es una conversación con nombre y día.

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan. Para no recibir más: {url_baja}$t$)
on conflict (tipo, n) do update set asunto = excluded.asunto, cuerpo = excluded.cuerpo;

-- El navegador entrega las fechas de su plan. Se borran las pendientes y se
-- ponen las nuevas: el plan se recalcula hasta que pasa la conversación.
-- Lo ya enviado no se vuelve a crear, y la cadena mensual, una vez empezada,
-- la sigue el servidor.
create or replace function public.programar_avisos(p_filas jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  e  jsonb;
  t  text;
  k  int;
  f  timestamptz;
begin
  if yo is null then
    raise exception 'sin sesión' using errcode = '42501';
  end if;
  if jsonb_typeof(p_filas) <> 'array' or jsonb_array_length(p_filas) > 10 then
    raise exception 'filas no válidas' using errcode = '22023';
  end if;

  -- Todo se valida antes de tocar nada.
  for e in select * from jsonb_array_elements(p_filas) loop
    t := e->>'tipo';
    if t is null or t not in ('semana', 'mes') then
      raise exception 'tipo no válido' using errcode = '22023';
    end if;
    if jsonb_typeof(e->'n') <> 'number' or (e->>'n')::numeric <> trunc((e->>'n')::numeric) then
      raise exception 'n no válido' using errcode = '22023';
    end if;
    k := (e->>'n')::int;
    if (t = 'semana' and k not between 1 and 4) or (t = 'mes' and k <> 1) then
      raise exception 'n no válido' using errcode = '22023';
    end if;
    begin
      f := (e->>'envio_en')::timestamptz;
    exception when others then
      raise exception 'envio_en no válido' using errcode = '22023';
    end;
    if f is null then
      raise exception 'envio_en no válido' using errcode = '22023';
    end if;
  end loop;

  insert into aviso (user_id) values (yo)
  on conflict (user_id) do update set activo = true;

  delete from recordatorio where user_id = yo and estado = 'pendiente';

  for e in select * from jsonb_array_elements(p_filas) loop
    t := e->>'tipo';
    k := (e->>'n')::int;
    f := (e->>'envio_en')::timestamptz;
    continue when f <= now();
    continue when t = 'mes' and exists (
      select 1 from recordatorio
      where user_id = yo and tipo = 'mes' and estado <> 'pendiente');
    -- Tras el borrado solo quedan filas no pendientes: el conflicto es
    -- exactamente «ya existe una no pendiente del mismo (tipo, n)».
    insert into recordatorio (user_id, tipo, n, envio_en)
    values (yo, t, k, f)
    on conflict (user_id, tipo, n) do nothing;
  end loop;
end $$;

create or replace function public.parar_avisos()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'sin sesión' using errcode = '42501';
  end if;
  update aviso set activo = false where user_id = auth.uid();
  delete from recordatorio where user_id = auth.uid() and estado = 'pendiente';
end $$;

-- El enlace de baja de los correos. Sin sesión: el token es la llave.
create or replace function public.baja_avisos(t uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  quien uuid;
begin
  select user_id into quien from aviso where baja = t;
  if quien is null then
    return false;
  end if;
  update aviso set activo = false where user_id = quien;
  delete from recordatorio where user_id = quien and estado = 'pendiente';
  return true;
end $$;

-- La que llama pg_cron. Nadie más puede ejecutarla.
create or replace function public.enviar_avisos()
returns void
language plpgsql security definer set search_path = public as $$
declare
  token  text;
  desde  text;
  r      record;
  cuerpo text;
  baja   text;
  pet    bigint;
begin
  -- a) Lo enviado cuya respuesta no fue 200 pasa a error.
  update recordatorio rc set estado = 'error'
  from net._http_response h
  where rc.estado = 'enviado' and rc.peticion is not null
    and h.id = rc.peticion and h.status_code <> 200;

  -- b) Lo que lleva más de dos días esperando ya no se manda.
  update recordatorio set estado = 'caducado'
  where estado = 'pendiente' and envio_en < now() - interval '2 days';

  select decrypted_secret into token from vault.decrypted_secrets where name = 'postmark_token';
  select decrypted_secret into desde from vault.decrypted_secrets where name = 'postmark_from';
  -- Sin los dos secretos no se envía nada, y nada se marca como enviado.
  if token is null or desde is null then
    return;
  end if;

  -- c) Lo que toca ahora.
  for r in
    select rc.id, rc.user_id, rc.tipo, rc.n, rc.envio_en, u.email, a.baja,
           tx.asunto, tx.cuerpo
    from recordatorio rc
    join aviso a on a.user_id = rc.user_id and a.activo
    join auth.users u on u.id = rc.user_id
    join aviso_texto tx on tx.tipo = rc.tipo
                       and tx.n = case when rc.tipo = 'mes' then 0 else rc.n end
    where rc.estado = 'pendiente' and rc.envio_en <= now()
      and u.email is not null
    order by rc.envio_en
    for update of rc skip locked
  loop
    baja := 'https://guia.qtorb.com/#/baja?t=' || r.baja::text;
    cuerpo := replace(replace(r.cuerpo,
      '{url_plan}', 'https://guia.qtorb.com/#/metodo/plan'),
      '{url_baja}', baja);

    select net.http_post(
      url := 'https://api.postmarkapp.com/email',
      headers := jsonb_build_object(
        'Accept', 'application/json',
        'Content-Type', 'application/json',
        'X-Postmark-Server-Token', token),
      body := jsonb_build_object(
        'From', desde,
        'To', r.email,
        'Subject', r.asunto,
        'TextBody', cuerpo,
        'MessageStream', 'outbound',
        'Headers', jsonb_build_array(jsonb_build_object(
          'Name', 'List-Unsubscribe', 'Value', '<' || baja || '>')))
    ) into pet;

    update recordatorio
    set peticion = pet, enviado_en = now(), estado = 'enviado'
    where id = r.id;

    if r.tipo = 'mes' then
      insert into recordatorio (user_id, tipo, n, envio_en)
      values (r.user_id, 'mes', r.n + 1, r.envio_en + interval '1 month')
      on conflict (user_id, tipo, n) do nothing;
    end if;
  end loop;
end $$;

-- Quién puede llamar a qué. Supabase da EXECUTE a anon y authenticated por
-- defecto en las funciones nuevas; aquí se quita y se da solo lo justo.
revoke all on function public.programar_avisos(jsonb) from public, anon, authenticated;
revoke all on function public.parar_avisos()          from public, anon, authenticated;
revoke all on function public.baja_avisos(uuid)       from public, anon, authenticated;
revoke all on function public.enviar_avisos()         from public, anon, authenticated;

grant execute on function public.programar_avisos(jsonb) to authenticated;
grant execute on function public.parar_avisos()          to authenticated;
grant execute on function public.baja_avisos(uuid)       to anon, authenticated;

-- La tarea programada (cada diez minutos) NO va en esta migración: solo se
-- programa cuando existen en Vault los dos secretos, postmark_token y
-- postmark_from. Con ellos:
--
--   select cron.schedule('enviar-avisos', '*/10 * * * *', $$select public.enviar_avisos()$$);
