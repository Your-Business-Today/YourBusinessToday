-- 0161: a manager makes a chatbot onto the organisation's Your Business Brain
-- and says which parts of it the chatbot may read and who may use it.
--
--   business_brain_chatbots          a named, read-only door onto part of the brain
--   business_brain_chatbot_parts     each part of the brain a chatbot may read
--   business_brain_chatbot_members   each person who may use a chatbot, by email
--
-- A chatbot is a door for a person's own Claude: YBT calls no AI model, and
-- there are no credits, allowances or top-ups. The old chatbot tables of 0031
-- are left exactly as they are: no statement here names one.
--
-- A part or a person is taken away by dating its row (removed_at, removed_by),
-- never by deleting it, so who could read what, and when, stays on record; a
-- trigger keeps every other column as it was added. At most one current row
-- per chatbot and part, and per chatbot and email. Emails are kept in lower
-- case. Every row carries its organisation and the foreign keys include it,
-- so a chatbot can never read another organisation's part. Nothing is deleted
-- by a cascade. The limits match businessBrainChatbotLimits
-- (businessBrainChatbotRules.ts).
--
-- People with the module read the chatbots; only a manager of the
-- organisation, or staff, with the module on, makes or changes one
-- (can_manage_organisation and the one module rule). No policy deletes a row.
--
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.business_brain_chatbots (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.business_brains (organisation_id) on delete restrict,
	name text not null check (char_length(name) between 1 and 120),
	made_by uuid references auth.users (id) on delete set null,
	made_at timestamptz not null default now(),
	unique (id, organisation_id)
);

create table if not exists public.business_brain_chatbot_parts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	chatbot_id uuid not null,
	part_id uuid not null,
	added_by uuid references auth.users (id) on delete set null,
	added_at timestamptz not null default now(),
	removed_by uuid references auth.users (id) on delete set null,
	removed_at timestamptz,
	check (removed_at is null or removed_at >= added_at),
	foreign key (chatbot_id, organisation_id)
		references public.business_brain_chatbots (id, organisation_id) on delete restrict,
	foreign key (part_id, organisation_id)
		references public.business_brain_parts (id, organisation_id) on delete restrict
);

create table if not exists public.business_brain_chatbot_members (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	chatbot_id uuid not null,
	email text not null check (
		char_length(email) between 3 and 320
		and email = lower(email)
		and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
	),
	added_by uuid references auth.users (id) on delete set null,
	added_at timestamptz not null default now(),
	removed_by uuid references auth.users (id) on delete set null,
	removed_at timestamptz,
	check (removed_at is null or removed_at >= added_at),
	foreign key (chatbot_id, organisation_id)
		references public.business_brain_chatbots (id, organisation_id) on delete restrict
);

create unique index if not exists business_brain_chatbots_one_name
	on public.business_brain_chatbots (organisation_id, lower(name));
create unique index if not exists business_brain_chatbot_parts_one_current
	on public.business_brain_chatbot_parts (chatbot_id, part_id) where removed_at is null;
create unique index if not exists business_brain_chatbot_members_one_current
	on public.business_brain_chatbot_members (chatbot_id, email) where removed_at is null;
create index if not exists business_brain_chatbot_members_by_email
	on public.business_brain_chatbot_members (email) where removed_at is null;
create index if not exists business_brain_chatbot_parts_by_part
	on public.business_brain_chatbot_parts (part_id);

create or replace function public.business_brain_chatbot_grants_keep_their_record()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
	dated_columns constant text[] := array['added_by', 'removed_by', 'removed_at'];
begin
	if (to_jsonb(new) - dated_columns) <> (to_jsonb(old) - dated_columns)
		or (new.added_by is distinct from old.added_by and new.added_by is not null)
		or (old.removed_at is not null and new.removed_at is distinct from old.removed_at)
		or (old.removed_at is not null and new.removed_by is distinct from old.removed_by and new.removed_by is not null)
	then
		raise exception 'A chatbot''s part or person is kept as it was added; taking it away is the only change.';
	end if;
	return new;
end;
$$;

create or replace trigger business_brain_chatbot_parts_keep_their_record
	before update on public.business_brain_chatbot_parts
	for each row execute function public.business_brain_chatbot_grants_keep_their_record();

create or replace trigger business_brain_chatbot_members_keep_their_record
	before update on public.business_brain_chatbot_members
	for each row execute function public.business_brain_chatbot_grants_keep_their_record();

alter table public.business_brain_chatbots enable row level security;
alter table public.business_brain_chatbot_parts enable row level security;
alter table public.business_brain_chatbot_members enable row level security;

drop policy if exists "people with the module read its chatbots" on public.business_brain_chatbots;
create policy "people with the module read its chatbots" on public.business_brain_chatbots
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "managers with the module make chatbots" on public.business_brain_chatbots;
create policy "managers with the module make chatbots" on public.business_brain_chatbots
	for insert with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "people with the module read what chatbots read" on public.business_brain_chatbot_parts;
create policy "people with the module read what chatbots read" on public.business_brain_chatbot_parts
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "managers with the module say what chatbots read" on public.business_brain_chatbot_parts;
create policy "managers with the module say what chatbots read" on public.business_brain_chatbot_parts
	for insert with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "managers with the module take parts from chatbots" on public.business_brain_chatbot_parts;
create policy "managers with the module take parts from chatbots" on public.business_brain_chatbot_parts
	for update using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	) with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "people with the module read who uses chatbots" on public.business_brain_chatbot_members;
create policy "people with the module read who uses chatbots" on public.business_brain_chatbot_members
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "managers with the module say who uses chatbots" on public.business_brain_chatbot_members;
create policy "managers with the module say who uses chatbots" on public.business_brain_chatbot_members
	for insert with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "managers with the module take people from chatbots" on public.business_brain_chatbot_members;
create policy "managers with the module take people from chatbots" on public.business_brain_chatbot_members
	for update using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	) with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

commit;

notify pgrst, 'reload schema';
