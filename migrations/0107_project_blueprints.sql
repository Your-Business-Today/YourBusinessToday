-- 0107: each project keeps what YBT last read of its product from its repository.
--
-- On every push to a project's default branch, and from the project's Domain and
-- Site map pages, YBT reads the entity manifest (docs/05-data-model/entities.json)
-- and the kit's site definition (tools/refactor/site-definition.md) and keeps
-- them here: the domain as bounded contexts, aggregates and relationships, the
-- site map as its screens. One row per project, replaced on each reading.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.project_blueprints (
	project_id uuid primary key references public.projects (id) on delete cascade,
	domain jsonb,
	site_map jsonb,
	read_at_commit text not null default '',
	read_at timestamptz not null default now()
);

alter table public.project_blueprints enable row level security;

drop policy if exists "people read blueprints of their projects" on public.project_blueprints;
create policy "people read blueprints of their projects" on public.project_blueprints
	for select using (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
