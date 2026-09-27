-- El checkpoint semanal reemplaza al aviso mensual: desde la semana 5, un
-- correo cada semana con las cuatro preguntas, sin fecha de fin. Se puede
-- pausar dos semanas o llevar una nota (con quién habla la próxima semana)
-- que se cuela en el correo siguiente y se borra al enviarlo.
--
-- Compatible con la web publicada hasta que se mergee esta entrega:
-- programar_avisos() sigue aceptando filas 'mes' y las ignora en silencio.

-- D1. aviso: pausa y nota.
alter table public.aviso add column if not exists pausa_hasta timestamptz;
alter table public.aviso add column if not exists nota text
  check (char_length(nota) <= 120);

-- D2. recordatorio: el tipo 'checkpoint' y el estado 'pausado'.
alter table public.recordatorio drop constraint if exists recordatorio_tipo_check;
alter table public.recordatorio add constraint recordatorio_tipo_check
  check (tipo in ('semana', 'mes', 'checkpoint'));

alter table public.recordatorio drop constraint if exists recordatorio_estado_check;
alter table public.recordatorio add constraint recordatorio_estado_check
  check (estado in ('pendiente', 'enviado', 'error', 'caducado', 'pausado'));

-- D3. Fuera el aviso mensual: no quedan recordatorios pendientes de ese tipo
-- ni su texto, que el checkpoint sustituye.
delete from public.recordatorio where tipo = 'mes' and estado = 'pendiente';
delete from public.aviso_texto where tipo = 'mes';

-- D4. Los cinco textos: las cuatro semanas del primer mes (ahora con la
-- línea del checkpoint) y el correo de checkpoint en sí.
insert into public.aviso_texto (tipo, n, asunto, cuerpo) values
('semana', 1, 'Tu mes · semana 1: tres frases de alguien de fuera', $t$Hoy cierra la semana 1 de tu plan.

Lo que tendría que existir ya: tres frases literales de la persona con la que hablaste, apuntadas tal cual las dijo.

Si la conversación ya ha pasado, abre el texto «Cerrar la tanda» (en tu carpeta es textos/4_cerrar_la_tanda.md) y ciérrala con uno de los tres veredictos: aguanta, aguanta pero no como lo contabas, o se cae.

Si todavía no ha pasado, la semana 1 se alarga hasta contenerla. Lo que no se mueve es que ocurra.

Y tu checkpoint de esta semana: cuatro preguntas y un veredicto, media hora. {url_checkpoint}

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan.
Parar dos semanas: {url_pausa}
No recibir más: {url_baja}$t$),
('semana', 2, 'Tu mes · semana 2: una dirección que puedes mandar por WhatsApp', $t$Hoy cierra la semana 2 de tu plan.

Lo que tendría que existir ya: una dirección que se abre en un móvil y explica qué ofreces y a quién.

Antes de encargarla, tres líneas con lo que tiene que cumplir para que valga, y que una de ellas pueda fallar. El texto es «Escribir el encargo» (textos/1_escribir_el_encargo.md).

Si no está, muévela una semana. Lo que no se mueve es el orden: sin dirección no hay semana 3.

Y tu checkpoint de esta semana: cuatro preguntas y un veredicto, media hora. {url_checkpoint}

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan.
Parar dos semanas: {url_pausa}
No recibir más: {url_baja}$t$),
('semana', 3, 'Tu mes · semana 3: qué no se entiende sin ti delante', $t$Hoy cierra la semana 3 de tu plan.

Lo que tendría que existir ya: cinco personas de tu público han mirado la página, y tienes apuntado lo que dijo cada una.

Lo que más te va a servir es dónde no coinciden. Ciérralo con «Cerrar la tanda» (textos/4_cerrar_la_tanda.md).

Y tu checkpoint de esta semana: cuatro preguntas y un veredicto, media hora. {url_checkpoint}

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan.
Parar dos semanas: {url_pausa}
No recibir más: {url_baja}$t$),
('semana', 4, 'Tu mes · semana 4: fuera, y sabes qué mirar', $t$Hoy cierra tu mes.

Lo que tendría que existir ya: la página publicada, y escrito qué cambiaste por lo que te dijeron.

Y una comprobación que puedas hacer tú solo cada semana, sin preguntar a nadie. Para lo siguiente, «Abrir la siguiente tanda» (textos/4_cerrar_la_tanda.md).

Y tu checkpoint de esta semana: cuatro preguntas y un veredicto, media hora. {url_checkpoint}

A partir de aquí te escribo cada semana, el día de tu checkpoint, con sus cuatro preguntas. Sin fecha de fin: hasta que me digas que pare.

Tu plan: {url_plan}

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan.
Parar dos semanas: {url_pausa}
No recibir más: {url_baja}$t$),
('checkpoint', 0, 'Tu checkpoint · semana {n}', $t${nota}Hoy toca tu checkpoint. Media hora y cuatro preguntas:

1. ¿Qué decisión concreta ha mejorado esta semana gracias a lo que he hecho?
2. ¿Qué estamos haciendo por inercia y ya no sé justificar?
3. ¿Qué contacto con el mundo real he tenido?
4. ¿Sigue cada cosa en su columna?

Y un veredicto que firmas tú: seguimos, cambiamos o paramos.

Contéstalas aquí y te llevas el bloque para tu 07_CIERRE.md: {url_checkpoint}

O con tu IA y tu carpeta delante: el texto 5 (textos/5_checkpoint.md).

— Albert Garcia Pujadas · Guía AI-First
Te escribo porque lo pediste en tu plan.
Parar dos semanas: {url_pausa}
No recibir más: {url_baja}$t$)
on conflict (tipo, n) do update set asunto = excluded.asunto, cuerpo = excluded.cuerpo;

-- D5. programar_avisos: 'mes' se acepta y se ignora (compatibilidad con la
-- web publicada hasta el merge); 'checkpoint' nuevo, como mucho una fila.
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
  if (select count(*) from jsonb_array_elements(p_filas) x where x->>'tipo' = 'checkpoint') > 1 then
    raise exception 'filas no válidas' using errcode = '22023';
  end if;

  -- Todo se valida antes de tocar nada.
  for e in select * from jsonb_array_elements(p_filas) loop
    t := e->>'tipo';
    if t is null or t not in ('semana', 'mes', 'checkpoint') then
      raise exception 'tipo no válido' using errcode = '22023';
    end if;
    if jsonb_typeof(e->'n') <> 'number' or (e->>'n')::numeric <> trunc((e->>'n')::numeric) then
      raise exception 'n no válido' using errcode = '22023';
    end if;
    k := (e->>'n')::int;
    if (t = 'semana' and k not between 1 and 4)
       or (t = 'mes' and k <> 1)
       or (t = 'checkpoint' and k not between 5 and 600) then
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
    continue when t = 'mes';
    continue when f <= now();
    -- Tras el borrado solo quedan filas no pendientes: el conflicto es
    -- exactamente «ya existe una no pendiente del mismo (tipo, n)».
    insert into recordatorio (user_id, tipo, n, envio_en)
    values (yo, t, k, f)
    on conflict (user_id, tipo, n) do nothing;
  end loop;
end $$;

-- D6. Pausar, reanudar y dejar una nota para el próximo correo.
create or replace function public.pausar_avisos()
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  r  timestamptz;
begin
  if yo is null then
    raise exception 'sin sesión' using errcode = '42501';
  end if;
  update aviso set pausa_hasta = now() + interval '14 days'
  where user_id = yo and activo
  returning pausa_hasta into r;
  return r;
end $$;

-- El enlace de pausa de los correos. Sin sesión: el token es la llave, igual
-- que baja_avisos(t).
create or replace function public.pausar_avisos_enlace(t uuid)
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  r timestamptz;
begin
  update aviso set pausa_hasta = now() + interval '14 days'
  where baja = t and activo
  returning pausa_hasta into r;
  return r;
end $$;

create or replace function public.reanudar_avisos()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'sin sesión' using errcode = '42501';
  end if;
  update aviso set pausa_hasta = null where user_id = auth.uid();
end $$;

create or replace function public.nota_aviso(p_nota text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'sin sesión' using errcode = '42501';
  end if;
  update aviso set nota = nullif(left(btrim(coalesce(p_nota, '')), 120), '')
  where user_id = auth.uid();
end $$;

revoke all on function public.pausar_avisos()          from public, anon, authenticated;
revoke all on function public.pausar_avisos_enlace(uuid) from public, anon, authenticated;
revoke all on function public.reanudar_avisos()         from public, anon, authenticated;
revoke all on function public.nota_aviso(text)          from public, anon, authenticated;

grant execute on function public.pausar_avisos_enlace(uuid) to anon, authenticated;
grant execute on function public.pausar_avisos()            to authenticated;
grant execute on function public.reanudar_avisos()           to authenticated;
grant execute on function public.nota_aviso(text)            to authenticated;

-- D7. enviar_avisos(): la pausa detiene el envío (y encadena el siguiente
-- checkpoint sin mandar nada), la nota se cuela en el correo y se borra al
-- enviarlo, y cada checkpoint enviado o caducado encadena el siguiente a una
-- semana vista. Fuera el encadenado de 'mes'.
create or replace function public.enviar_avisos()
returns void
language plpgsql security definer set search_path = public as $$
declare
  token  text;
  desde  text;
  r      record;
  asunto text;
  cuerpo text;
  baja   text;
  pausa  text;
  notatx text;
  pet    bigint;
begin
  -- a) Lo enviado cuya respuesta no fue 200 pasa a error.
  update recordatorio rc set estado = 'error'
  from net._http_response h
  where rc.estado = 'enviado' and rc.peticion is not null
    and h.id = rc.peticion and h.status_code <> 200;

  -- b) Lo que lleva más de dos días esperando ya no se manda; si era un
  -- checkpoint, la cadena sigue con el siguiente, a una semana vista.
  with caducadas as (
    update recordatorio set estado = 'caducado'
    where estado = 'pendiente' and envio_en < now() - interval '2 days'
    returning user_id, tipo, n, envio_en
  )
  insert into recordatorio (user_id, tipo, n, envio_en)
  select user_id, 'checkpoint', n + 1, envio_en + interval '7 days'
  from caducadas where tipo = 'checkpoint'
  on conflict (user_id, tipo, n) do nothing;

  select decrypted_secret into token from vault.decrypted_secrets where name = 'postmark_token';
  select decrypted_secret into desde from vault.decrypted_secrets where name = 'postmark_from';
  -- Sin los dos secretos no se envía nada, y nada se marca como enviado.
  if token is null or desde is null then
    return;
  end if;

  -- c) Lo que toca ahora.
  for r in
    select rc.id, rc.user_id, rc.tipo, rc.n, rc.envio_en, u.email, a.baja,
           a.pausa_hasta, a.nota, tx.asunto, tx.cuerpo
    from recordatorio rc
    join aviso a on a.user_id = rc.user_id and a.activo
    join auth.users u on u.id = rc.user_id
    join aviso_texto tx on tx.tipo = rc.tipo
                       and tx.n = case when rc.tipo in ('mes', 'checkpoint') then 0 else rc.n end
    where rc.estado = 'pendiente' and rc.envio_en <= now()
      and u.email is not null
    order by rc.envio_en
    for update of rc skip locked
  loop
    -- En pausa: no se manda nada. Si es un checkpoint, la cadena sigue.
    if r.pausa_hasta is not null and r.envio_en < r.pausa_hasta then
      update recordatorio set estado = 'pausado' where id = r.id;
      if r.tipo = 'checkpoint' then
        insert into recordatorio (user_id, tipo, n, envio_en)
        values (r.user_id, 'checkpoint', r.n + 1, r.envio_en + interval '7 days')
        on conflict (user_id, tipo, n) do nothing;
      end if;
      continue;
    end if;

    notatx := case when r.nota is not null
      then 'Dijiste que esta semana empezaba por hablar con ' || r.nota || '.' || E'\n\n'
      else '' end;
    baja  := 'https://guia.qtorb.com/#/baja?t=' || r.baja::text;
    pausa := 'https://guia.qtorb.com/#/pausa?t=' || r.baja::text;

    asunto := replace(replace(replace(replace(replace(replace(r.asunto,
      '{nota}', notatx),
      '{url_plan}', 'https://guia.qtorb.com/#/metodo/plan'),
      '{url_checkpoint}', 'https://guia.qtorb.com/#/metodo/checkpoint'),
      '{url_pausa}', pausa),
      '{url_baja}', baja),
      '{n}', r.n::text);
    cuerpo := replace(replace(replace(replace(replace(replace(r.cuerpo,
      '{nota}', notatx),
      '{url_plan}', 'https://guia.qtorb.com/#/metodo/plan'),
      '{url_checkpoint}', 'https://guia.qtorb.com/#/metodo/checkpoint'),
      '{url_pausa}', pausa),
      '{url_baja}', baja),
      '{n}', r.n::text);

    select net.http_post(
      url := 'https://api.postmarkapp.com/email',
      headers := jsonb_build_object(
        'Accept', 'application/json',
        'Content-Type', 'application/json',
        'X-Postmark-Server-Token', token),
      body := jsonb_build_object(
        'From', desde,
        'To', r.email,
        'Subject', asunto,
        'TextBody', cuerpo,
        'MessageStream', 'outbound',
        'Headers', jsonb_build_array(jsonb_build_object(
          'Name', 'List-Unsubscribe', 'Value', '<' || baja || '>')))
    ) into pet;

    update recordatorio
    set peticion = pet, enviado_en = now(), estado = 'enviado'
    where id = r.id;

    if r.nota is not null then
      update aviso set nota = null where user_id = r.user_id;
    end if;

    if r.tipo = 'checkpoint' then
      insert into recordatorio (user_id, tipo, n, envio_en)
      values (r.user_id, 'checkpoint', r.n + 1, r.envio_en + interval '7 days')
      on conflict (user_id, tipo, n) do nothing;
    end if;
  end loop;
end $$;

-- D8. Panel: cuántas semanas de checkpoint lleva cerradas cada persona (solo
-- se cuenta, nunca lo escrito), y el resumen de avisos.
drop function public.panel_personas();

create or replace function public.panel_personas()
returns table (
  correo text,
  nombre text,
  via text,
  alta timestamptz,
  ultima_actividad timestamptz,
  hojas jsonb,          -- { "<n>": { "paso": int, "total": int, "fin": bool } }
  metodo_paso int,      -- paso alcanzado en el recorrido (1..7) o null
  plan30 boolean,       -- ha empezado el plan de 30 días
  semanas_cerradas int  -- cuántos checkpoints semanales ha guardado
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
      public._jsonb_o_null(x.datos->>'ialab-dossier-v2')   as ia,
      public._jsonb_o_null(x.datos->>'metodo-ai-first')    as me,
      public._jsonb_o_null(x.datos->>'metodo-plan30')      as p30,
      public._jsonb_o_null(x.datos->>'metodo-checkpoints') as cp
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
    coalesce(jsonb_typeof(d.p30) = 'object' and d.p30 <> '{}'::jsonb, false),
    coalesce(jsonb_array_length(
      case when jsonb_typeof(d.cp->'semanas') = 'array' then d.cp->'semanas' else null end
    ), 0)
  from auth.users u
  left join d on d.user_id = u.id
  order by d.actualizado asc nulls first;
end $$;

create or replace function public.panel_avisos()
returns table (activos int, en_pausa int, correos_semana int, correos_checkpoint int)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public._es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  return query
  select
    (select count(*)::int from public.aviso where activo),
    (select count(*)::int from public.aviso where activo and pausa_hasta > now()),
    (select count(*)::int from public.recordatorio where tipo = 'semana' and estado = 'enviado'),
    (select count(*)::int from public.recordatorio where tipo = 'checkpoint' and estado = 'enviado');
end $$;

revoke all on function public.panel_personas() from public, anon;
revoke all on function public.panel_avisos()   from public, anon;
grant execute on function public.panel_personas() to authenticated;
grant execute on function public.panel_avisos()   to authenticated;

-- D9. pg_cron no se toca: enviar-avisos sigue llamando a enviar_avisos() cada
-- diez minutos, tal cual estaba programada.
