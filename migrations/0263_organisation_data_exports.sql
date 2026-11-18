-- 0263: a client's administrator exports everything their organisation keeps in
-- the Platform, at any time, without asking us (task 8559a9a5).
--
-- MSA clause 8.6 promised the Platform's Client Data on written request within 10
-- Business Days. The organisation's Your data tab, and the connector's
-- export_organisation_data, now make the export themselves: a CSV for every table
-- that holds the organisation's rows, and every stored file in its original
-- format, zipped into one or more parts.
--
-- organisation_data_exports is the log of every export: who made it, when, and
-- what it held. A manager of the organisation reads it; only the service role
-- writes it, after the export is stored.
--
-- organisation-data-exports is the private bucket the parts are kept in. No
-- policy opens it: the site hands out a signed link, an hour long.
--
-- organisation_table_rows reads one table's rows for an organisation as JSON, in
-- one call, so a table of more than a thousand rows is never cut short by the
-- API. A table with no organisation column is reached through its parents.
-- Only the service role may call it, and the site calls it only after its own
-- gate has said the caller manages the organisation.
--
-- Adds only: a new table, a new bucket and a new function. Safe to re-run.

begin;

set local lock_timeout = '10s';
set local statement_timeout = '2min';

create table if not exists public.organisation_data_exports (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	exported_by uuid references auth.users (id) on delete set null,
	table_count integer not null check (table_count >= 0),
	row_count bigint not null check (row_count >= 0),
	file_count integer not null check (file_count >= 0),
	byte_count bigint not null check (byte_count >= 0),
	part_count integer not null check (part_count >= 1),
	storage_folder text not null check (char_length(storage_folder) between 1 and 200),
	exported_at timestamptz not null default now()
);

create index if not exists organisation_data_exports_by_organisation
	on public.organisation_data_exports (organisation_id, exported_at desc);

alter table public.organisation_data_exports enable row level security;

drop policy if exists "managers read their organisation's exports" on public.organisation_data_exports;
create policy "managers read their organisation's exports" on public.organisation_data_exports
	for select using (public.can_manage_organisation(organisation_id));

insert into storage.buckets (id, name, public)
values ('organisation-data-exports', 'organisation-data-exports', false)
on conflict (id) do nothing;

create or replace function public.organisation_table_rows(
	organisation uuid,
	table_name text,
	key_column text,
	parent_tables text[] default '{}',
	parent_key_columns text[] default '{}'
)
returns json
language plpgsql
stable
set search_path = public
as $$
declare
	filter text := '= $1';
	answer json;
begin
	if coalesce(array_length(parent_tables, 1), 0) <> coalesce(array_length(parent_key_columns, 1), 0) then
		raise exception 'organisation_table_rows needs one key column for each parent table';
	end if;
	for parent_number in reverse coalesce(array_length(parent_tables, 1), 0) .. 1 loop
		filter := format(
			'in (select id from public.%I where %I %s)',
			parent_tables[parent_number], parent_key_columns[parent_number], filter
		);
	end loop;
	execute format(
		'select coalesce(json_agg(row_to_json(kept)), ''[]''::json) from public.%I kept where kept.%I %s',
		table_name, key_column, filter
	) into answer using organisation;
	return answer;
end;
$$;

revoke all on function public.organisation_table_rows(uuid, text, text, text[], text[]) from public, anon, authenticated;
grant execute on function public.organisation_table_rows(uuid, text, text, text[], text[]) to service_role;

commit;

notify pgrst, 'reload schema';
