-- «Borrar mis datos» borra la cuenta.
--
-- Hasta ahora borraba el dossier y dejaba la cuenta viva: quien pedía irse
-- seguía existiendo en auth.users con su correo, y volver a pedir un enlace le
-- traía el de «entrar», no el de alta. Ahora se borra la fila de auth.users y
-- lo demás cae en cascada: dossier, aviso y, desde aviso, recordatorio.
--
-- Solo puede borrarse a sí mismo: la función no recibe ningún identificador,
-- usa auth.uid().

create or replace function public.borrar_mi_cuenta()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'sin sesión' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.borrar_mi_cuenta() from public, anon, authenticated;
grant execute on function public.borrar_mi_cuenta() to authenticated;
