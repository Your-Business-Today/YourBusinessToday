-- 0294: each project sharing a cost carries a weight, such as the seats it uses or a set proportion.
--
-- Asked for by James, 25 Nov 2026 (story 192e4473, task e0b97955): each month's
-- part of a shared cost is split in proportion to the weights of the projects
-- sharing it that month. A weight of 1 for every project is the equal split the
-- costs have had so far, so every member already kept takes 1. A weight change
-- takes effect from a month, like joining: the spell ends the month before and a
-- new spell carries the new weight, so the months before stay as they were.
--
-- The connector checks every weight first (costShareWeights.ts states the same
-- limits); the check here is the backstop. One new column with a default; no
-- existing row's other values change. Additive and safe to re-run; the code that
-- reads it stands without it.

begin;

set local lock_timeout = '10s';

alter table public.books_cost_share_members
	add column if not exists weight numeric(12, 4) not null default 1 check (weight > 0 and weight <= 1000000);

commit;

notify pgrst, 'reload schema';
