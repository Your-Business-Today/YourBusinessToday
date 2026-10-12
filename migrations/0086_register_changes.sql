-- 0086: next month's register file tells the feed who arrived, who left and
-- whose state changed. A trigger on register_companies writes the events, so
-- the monthly loader and a later daily watcher produce the same rows through
-- the same door; a source key per kind, company and month makes a re-run
-- write once. An outcode's first load is silent: there is nothing to differ
-- from. The insert itself is one trusted function the gated door also uses.
-- Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('company_arrived', 'New company'),
	('company_moved_in', 'Company moved in'),
	('company_left', 'Company left'),
	('status_changed', 'Status changed'),
	('accounts_category_changed', 'Accounts changed'),
	('accounts_overdue', 'Accounts overdue'),
	('charge_registered', 'Charge registered')
on conflict (kind) do update set label = excluded.label;

-- The one insert every area event goes through, with no gate of its own: the
-- gated door and the trusted triggers call it, and nothing else may.
create or replace function public.write_area_event(
	event_outcode text,
	event_sector text,
	event_patch_id uuid,
	event_kind text,
	event_company_number text,
	event_sighting_id uuid,
	event_client_id uuid,
	event_detail text,
	event_source_url text,
	event_source_key text,
	event_happened_at date,
	event_actor uuid
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	event_id uuid;
begin
	insert into public.area_events (
		outcode, sector, patch_id, kind, company_number, sighting_id, client_id,
		detail, source_url, source_key, happened_at, actor_account_id
	)
	values (
		event_outcode, event_sector, event_patch_id, event_kind, event_company_number, event_sighting_id,
		event_client_id, event_detail, event_source_url, event_source_key, event_happened_at, event_actor
	)
	on conflict (source_key) where source_key <> '' do nothing
	returning id into event_id;
	return event_id;
end;
$$;

revoke execute on function public.write_area_event(text, text, uuid, text, text, uuid, uuid, text, text, text, date, uuid) from public, anon, authenticated;

create or replace function public.record_area_event(
	event_outcode text,
	event_sector text,
	event_patch_id uuid,
	event_kind text,
	event_company_number text default '',
	event_sighting_id uuid default null,
	event_client_id uuid default null,
	event_detail text default '',
	event_source_url text default '',
	event_source_key text default '',
	event_happened_at date default null,
	event_actor uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not (public.is_project_manager() or auth.role() = 'service_role') then
		raise exception 'Only staff and the service role record area events' using errcode = '42501';
	end if;
	return public.write_area_event(
		event_outcode, event_sector, event_patch_id, event_kind, event_company_number, event_sighting_id,
		event_client_id, event_detail, event_source_url, event_source_key, event_happened_at, event_actor
	);
end;
$$;

-- A company incorporated within this many days of the month it first appears is new; older ones moved in.
create or replace function public.register_new_company_days()
returns integer
language sql
immutable
as $$ select 90; $$;

create or replace function public.register_change_key(event_kind text, company public.register_companies)
returns text
language sql
immutable
as $$ select event_kind || ':' || company.company_number || ':' || company.last_seen_month::text; $$;

create or replace function public.register_companies_write_area_events()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	is_first_load boolean;
	non_trading text := case when upper(new.account_category) in ('DORMANT', 'NO ACCOUNTS FILED') then ' (' || lower(new.account_category) || ')' else '' end;
begin
	if tg_op = 'INSERT' then
		select not exists (
			select 1 from public.register_loads
			where outcode = new.outcode and loaded_month < new.last_seen_month
		) into is_first_load;
		if is_first_load then
			return new;
		end if;
		if new.incorporated_on is not null and new.incorporated_on >= new.last_seen_month - public.register_new_company_days() then
			perform public.write_area_event(new.outcode, new.sector, null, 'company_arrived', new.company_number, null, null,
				new.name || non_trading, new.source_url, public.register_change_key('company_arrived', new), new.last_seen_month, null);
		else
			perform public.write_area_event(new.outcode, new.sector, null, 'company_moved_in', new.company_number, null, null,
				new.name || non_trading, new.source_url, public.register_change_key('company_moved_in', new), new.last_seen_month, null);
		end if;
		return new;
	end if;
	if new.is_gone and not old.is_gone then
		perform public.write_area_event(new.outcode, new.sector, null, 'company_left', new.company_number, null, null,
			new.name, new.source_url, public.register_change_key('company_left', new), new.last_seen_month, null);
		return new;
	end if;
	if new.company_status is distinct from old.company_status then
		perform public.write_area_event(new.outcode, new.sector, null, 'status_changed', new.company_number, null, null,
			new.name || ': ' || old.company_status || ' -> ' || new.company_status, new.source_url,
			public.register_change_key('status_changed', new), new.last_seen_month, null);
	end if;
	if new.account_category is distinct from old.account_category then
		perform public.write_area_event(new.outcode, new.sector, null, 'accounts_category_changed', new.company_number, null, null,
			new.name || ': ' || lower(old.account_category) || ' -> ' || lower(new.account_category), new.source_url,
			public.register_change_key('accounts_category_changed', new), new.last_seen_month, null);
	end if;
	if new.charge_count > old.charge_count then
		perform public.write_area_event(new.outcode, new.sector, null, 'charge_registered', new.company_number, null, null,
			new.name || ': ' || (new.charge_count - old.charge_count)::text || ' new charge(s)', new.source_url,
			public.register_change_key('charge_registered', new), new.last_seen_month, null);
	end if;
	if new.next_accounts_due is not null and new.next_accounts_due < new.last_seen_month
		and (old.next_accounts_due is null or old.next_accounts_due >= old.last_seen_month) then
		perform public.write_area_event(new.outcode, new.sector, null, 'accounts_overdue', new.company_number, null, null,
			new.name || ': accounts due ' || new.next_accounts_due::text, new.source_url,
			public.register_change_key('accounts_overdue', new), new.last_seen_month, null);
	end if;
	return new;
end;
$$;

drop trigger if exists register_companies_write_area_events on public.register_companies;
create trigger register_companies_write_area_events
	after insert or update of company_status, account_category, next_accounts_due, charge_count, is_gone
	on public.register_companies
	for each row execute function public.register_companies_write_area_events();

commit;

notify pgrst, 'reload schema';
