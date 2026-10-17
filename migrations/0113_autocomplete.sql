-- 0113: goals and tasks carry an autocomplete flag.
--
-- Autocomplete lets an AI that runs on a schedule take a goal's or a task's
-- work through to a merged pull request without asking anyone. It starts on
-- for every goal, so the timer-built way of working carries over unchanged.
-- A task holds its own setting only when someone gave it one: null means it
-- follows its goal (and a task with no goal counts as on).
--
-- Additive: two new columns, existing rows kept as they are. Safe to run twice.

begin;

alter table public.goals add column if not exists is_autocomplete boolean not null default true;
alter table public.tasks add column if not exists is_autocomplete boolean;

commit;

notify pgrst, 'reload schema';
