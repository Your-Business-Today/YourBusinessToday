-- 0076: two personal projects leave Jewel Enterprises.
--
-- The organisations seed (0075) filed every project with no organisation whose
-- name began "Jewel" under Jewel Enterprises, whoever owned it. Jewel PS and
-- JewelPFP Survey Glasses are other people's own projects that nobody at Jewel
-- Enterprises placed there: they showed on its organisation page, and the
-- staff who manage the organisation could not open them. A project under no
-- organisation is its owner's personal project, reached only by the people
-- they invite, so both go back to that, and the memberships the organisation
-- granted on them go with it. A direct invitation (no via_organisation_id)
-- stays. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

update public.projects
set organisation_id = null
where id in ('8b215f4c-bbe1-443c-91af-e11dfc6fecf3', '7de2863e-b117-4262-a989-b3c13cd44d7e')
	and organisation_id in (
		select id from public.organisations
		where lower(name) = 'jewel enterprises' and parent_organisation_id is null
	);

delete from public.project_members
where project_id in ('8b215f4c-bbe1-443c-91af-e11dfc6fecf3', '7de2863e-b117-4262-a989-b3c13cd44d7e')
	and via_organisation_id is not null;

commit;
