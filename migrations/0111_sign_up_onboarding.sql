-- 0111: a visitor signs up on yourbusiness.today and their onboarding begins.
--
-- Signing up makes the business a lead on the clients register, with
-- sign_up as its source, and an organisation for the same business, so the
-- organisation now names the client it is for. One client has at most one
-- organisation, which is how signing up again finds the organisation already
-- made rather than making a second.
--
-- Additive only: one new nullable column with its index, and one more lead
-- source allowed on clients and people. Safe to run twice.

begin;

alter table public.organisations
	add column if not exists client_id uuid references public.clients (id) on delete set null;

create unique index if not exists organisations_one_per_client
	on public.organisations (client_id) where client_id is not null;

alter table public.clients drop constraint if exists clients_lead_source_check;
alter table public.clients add constraint clients_lead_source_check
	check (lead_source in ('staff', 'website', 'research', 'companies_house', 'sighting', 'food_hygiene', 'places_dataset', 'sign_up'));

alter table public.people drop constraint if exists people_lead_source_check;
alter table public.people add constraint people_lead_source_check
	check (lead_source in ('staff', 'website', 'research', 'companies_house', 'sighting', 'food_hygiene', 'places_dataset', 'sign_up'));

commit;

notify pgrst, 'reload schema';
