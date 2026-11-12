-- 0201: a product brain. A manager ties parts of the organisation's Your
-- Business Brain to one of its products, and the parts tied to a product are
-- that product's brain, read by the people on it.
--
--   business_brain_product_parts   each part of the brain tied to a product
--
-- A part is untied by dating its row (untied_at, untied_by), never by deleting
-- it, so which product read which part, and when, stays on record; a trigger
-- keeps every other column as it was tied. At most one current row per product
-- and part. Every row carries its organisation, the part's foreign key includes
-- it, and the trigger refuses a product of another organisation, so a product
-- can never read another organisation's brain. Nothing is deleted by a cascade.
--
-- People with the module read the ties; only a manager of the organisation, or
-- staff, with the module on, ties or unties a part (can_manage_organisation and
-- the one module rule). No policy deletes a row. YBT calls no AI model.
--
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.business_brain_product_parts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	project_id uuid not null references public.projects (id) on delete restrict,
	part_id uuid not null,
	tied_by uuid references auth.users (id) on delete set null,
	tied_at timestamptz not null default now(),
	untied_by uuid references auth.users (id) on delete set null,
	untied_at timestamptz,
	check (untied_at is null or untied_at >= tied_at),
	foreign key (part_id, organisation_id)
		references public.business_brain_parts (id, organisation_id) on delete restrict
);

create unique index if not exists business_brain_product_parts_one_current
	on public.business_brain_product_parts (project_id, part_id) where untied_at is null;
create index if not exists business_brain_product_parts_by_part
	on public.business_brain_product_parts (part_id);

create or replace function public.business_brain_product_parts_keep_their_record()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
	dated_columns constant text[] := array['untied_by', 'untied_at'];
begin
	if tg_op = 'INSERT' then
		if not exists (
			select 1 from public.projects
			where projects.id = new.project_id and projects.organisation_id = new.organisation_id
		) then
			raise exception 'A part of the brain is tied only to a product of its own organisation.';
		end if;
		return new;
	end if;
	if (to_jsonb(new) - dated_columns) <> (to_jsonb(old) - dated_columns)
		or (old.untied_at is not null and new.untied_at is distinct from old.untied_at)
		or (old.untied_at is not null and new.untied_by is distinct from old.untied_by)
	then
		raise exception 'A part tied to a product is kept as it was tied; untying it is the only change.';
	end if;
	return new;
end;
$$;

create or replace trigger business_brain_product_parts_keep_their_record
	before insert or update on public.business_brain_product_parts
	for each row execute function public.business_brain_product_parts_keep_their_record();

alter table public.business_brain_product_parts enable row level security;

drop policy if exists "people with the module read what products read" on public.business_brain_product_parts;
create policy "people with the module read what products read" on public.business_brain_product_parts
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "managers with the module tie parts to products" on public.business_brain_product_parts;
create policy "managers with the module tie parts to products" on public.business_brain_product_parts
	for insert with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "managers with the module untie parts from products" on public.business_brain_product_parts;
create policy "managers with the module untie parts from products" on public.business_brain_product_parts
	for update using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	) with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

commit;
