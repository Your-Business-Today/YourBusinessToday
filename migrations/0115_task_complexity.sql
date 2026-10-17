-- 0115: a coding task records its complexity measures.
--
-- Whoever sizes a coding task, person or AI, records the same four measures:
-- how many existing views it changes, how many new views it creates, whether
-- the data structure changes, and how many domain objects it involves. YBT
-- turns them into story points by one stated formula, so every task is sized
-- the same way and the queue and the desktop app can rely on the points.
-- Empty until someone measures the task.
--
-- Additive: four new nullable columns, existing rows kept. Safe to run twice.

begin;

alter table public.tasks add column if not exists views_changed integer
	check (views_changed between 0 and 99);
alter table public.tasks add column if not exists new_views integer
	check (new_views between 0 and 99);
alter table public.tasks add column if not exists changes_data_structure boolean;
alter table public.tasks add column if not exists domain_objects integer
	check (domain_objects between 0 and 99);

commit;

notify pgrst, 'reload schema';
