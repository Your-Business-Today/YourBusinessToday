-- 0117: a task can be tagged buildable, and can name the model it needs.
--
-- Buildable means an AI's consideration found the task needs nothing from a
-- person and no infrastructure change, so a model may build it unattended.
-- The model a task needs follows its story points through the build models'
-- ranges (0116) unless the task names one itself: null means follow the points.
-- A named model that is later removed from the build models lets the task
-- follow its points again.
--
-- Additive: two new columns, existing rows kept as they are (not buildable,
-- following their points). Safe to run twice.

begin;

alter table public.tasks add column if not exists is_buildable boolean not null default false;
alter table public.tasks add column if not exists model_needed text
	references public.build_models (model_id) on update cascade on delete set null;

create index if not exists tasks_buildable_idx on public.tasks (project_id)
	where is_buildable and status <> 'done';

commit;

notify pgrst, 'reload schema';
