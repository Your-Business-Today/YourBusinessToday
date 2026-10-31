-- The continuity copy on the client record (Schedule 4 section 5.2): the day the client's own storage was
-- connected to their portal's monthly copy, the day the client confirmed they opened a copy, and who at the
-- client confirmed it. Recorded by staff by hand (James, 31 Oct 2026). Additive and safe to run twice.
alter table public.clients add column if not exists continuity_storage_connected_on date;
alter table public.clients add column if not exists continuity_copy_opened_on date;
alter table public.clients add column if not exists continuity_copy_confirmed_by text;

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'clients_continuity_copy_confirmed_by_length') then
		alter table public.clients add constraint clients_continuity_copy_confirmed_by_length
			check (continuity_copy_confirmed_by is null or char_length(continuity_copy_confirmed_by) <= 200);
	end if;
end $$;
