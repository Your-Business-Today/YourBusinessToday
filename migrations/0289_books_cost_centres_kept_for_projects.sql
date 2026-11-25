-- 0289: a cost centre in an organisation's books can be kept for one of its projects.
--
-- Asked for by James, 25 Nov 2026: he wants to see what each thing he works on
-- has cost and earned, such as ConservAqua's Azure spent on a sales lead or
-- Carp Mania, a game meant to earn in the stores. The books already keep lines
-- within cost centres; this ties a cost centre to the project it is kept for,
-- so the profit by project reading names the project. One project has at most
-- one cost centre in its organisation's books, so its figures are never split.
--
-- The connector checks that the project belongs to the same organisation
-- before it writes (costCentreProjects.ts). A project that is deleted leaves
-- its cost centre, and every line kept within it, where they are.
-- One column and one index added; no existing table, column or row is changed.
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

set local lock_timeout = '10s';

alter table public.books_cost_centres
	add column if not exists project_id uuid references public.projects (id) on delete set null;

create unique index if not exists books_cost_centres_one_per_project
	on public.books_cost_centres (organisation_id, project_id)
	where project_id is not null;

commit;

notify pgrst, 'reload schema';
