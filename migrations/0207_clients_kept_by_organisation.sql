-- 0207: every record on a sales register is kept by one organisation.
--
-- Leads and Clients sit in the side nav of the organisation picked there, but
-- the register they read (public.clients) belonged to no organisation, so every
-- organisation showed the same records: Nigel's leads for Your Business Today
-- showed under Jewel Enterprises too (James, 12 Nov 2026).
--
--   clients.kept_by_organisation_id   the organisation whose register holds
--                                     the record. Not organisations.client_id,
--                                     which names the record an organisation
--                                     was set up from.
--
-- Every record already there was put on the register by Your Business Today's
-- own team, so each is kept by Your Business Today. A record added with no
-- keeper named (the website's enquiry form, the Companies House feed, a
-- sighting, the connector) is Your Business Today's too, as it always was; the
-- Leads page names the organisation picked in the side nav. Once every record
-- has its keeper the column is required.
--
-- Additive and safe to re-run: the column is added only when it is not there,
-- only records with no keeper are given one, and the function and trigger
-- replace themselves. Nothing is dropped, renamed or deleted.

begin;

alter table public.clients
	add column if not exists kept_by_organisation_id uuid references public.organisations (id) on delete restrict;

create index if not exists clients_by_keeping_organisation on public.clients (kept_by_organisation_id);

create or replace function public.your_business_today_organisation_id()
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
	select id from public.organisations
	where parent_organisation_id is null and name = 'Your Business Today'
	order by created_at
	limit 1;
$$;

update public.clients
	set kept_by_organisation_id = public.your_business_today_organisation_id()
	where kept_by_organisation_id is null;

create or replace function public.keep_client_with_your_business_today_unless_named()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.kept_by_organisation_id is null then
		new.kept_by_organisation_id := public.your_business_today_organisation_id();
	end if;
	return new;
end;
$$;

drop trigger if exists clients_kept_by_an_organisation on public.clients;
create trigger clients_kept_by_an_organisation
	before insert on public.clients
	for each row execute function public.keep_client_with_your_business_today_unless_named();

do $$
begin
	if not exists (select 1 from public.clients where kept_by_organisation_id is null) then
		alter table public.clients alter column kept_by_organisation_id set not null;
	end if;
end;
$$;

commit;
