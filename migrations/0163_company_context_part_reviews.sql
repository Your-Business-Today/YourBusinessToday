-- 0163: a client marks each part of their company context right or not right from the portal.
--
-- Each mark is a row of its own, kept beside the part of the version it was made on: who made it, when, what
-- they said and, when the part is not right, what is wrong in their own words. A mark is never updated or
-- deleted, so a client who changes their mind adds a newer mark and every earlier one is kept. A part's review
-- is its latest mark, or what the client's Claude recorded on the part when nobody has marked it since.
--
-- The portal checks every value against these columns first (companyContextLimits.ts states the same limits);
-- the checks here are the backstop. Read and written by the server only, so row level security is on with no
-- policy. Additive and safe to re-run; the map and the connector stand without it.

begin;

create table if not exists public.company_context_part_reviews (
	id uuid primary key default gen_random_uuid(),
	part_id uuid not null references public.company_context_parts (id) on delete cascade,
	review_state text not null check (review_state in ('right', 'not_right')),
	what_is_wrong text check (what_is_wrong is null or char_length(what_is_wrong) between 1 and 1000),
	reviewed_by uuid references auth.users (id) on delete set null,
	reviewed_at timestamptz not null default now(),
	check ((review_state = 'not_right') = (what_is_wrong is not null))
);

create index if not exists company_context_part_reviews_latest
	on public.company_context_part_reviews (part_id, reviewed_at desc);

alter table public.company_context_part_reviews enable row level security;

commit;

notify pgrst, 'reload schema';
