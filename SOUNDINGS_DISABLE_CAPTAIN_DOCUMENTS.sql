-- Optional database rollback. Requires Soundings. Preserve ship books, settings, history and invoice reservations.
begin;
do $undo$
declare previous text;
begin
 select pg_get_functiondef(to_regprocedure('fleet_private.qm_require_admiral_scope(jsonb)')) into previous;
 if previous is null then raise exception 'Original workspace guard is unavailable. No changes applied.';end if;
 if (select md5(prosrc) from pg_proc where oid='fleet_private.qm_require_scope(jsonb)'::regprocedure)
    is distinct from '59b0e59875d0a44e244adfd26bbc0f07' then
   raise exception 'The installed workspace guard differs from Soundings. Review the installed version before rollback.';
 end if;
 execute replace(previous,'FUNCTION fleet_private.qm_require_admiral_scope(', 'FUNCTION fleet_private.qm_require_scope(');
end $undo$;
revoke all on function public.vessel_captain_document_tool(text,boolean,bigint) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
