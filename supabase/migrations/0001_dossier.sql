-- Sincronizar lo que escribe cada persona entre sus dispositivos.
--
-- Una fila por usuario y un JSON dentro. No está normalizado a propósito: lo
-- que se guarda es exactamente lo que el navegador tiene en localStorage, y
-- partirlo en tablas obligaría a mantener dos formas del mismo dato —la del
-- navegador y la de la base— sincronizadas a mano. El día que haga falta
-- consultar por dentro (cuántos han hecho el bloque 3, por ejemplo), eso es
-- una vista sobre el JSON, no un rediseño.
--
-- Este fichero vive en el repositorio porque el esquema es parte del
-- producto, no un ajuste de un panel. Hoy se aplica a mano desde el SQL
-- Editor de Supabase; la carpeta tiene el formato que espera la integración
-- de GitHub por si algún día se enciende.

create table if not exists public.dossier (
  user_id     uuid primary key references auth.users on delete cascade,
  datos       jsonb       not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

alter table public.dossier enable row level security;

-- LA LÍNEA QUE PROTEGE LOS DATOS. No es la clave anónima de la web: esa viaja
-- dentro del JavaScript que descarga cualquiera y no es un secreto. Es esto.
-- Sin esta política, quien tuviera la clave pública leería las filas de todas
-- las personas; con ella, la base solo devuelve las suyas, y lo comprueba el
-- servidor, no el navegador.
drop policy if exists "cada uno la suya" on public.dossier;
create policy "cada uno la suya"
  on public.dossier for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
