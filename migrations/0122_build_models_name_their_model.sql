-- 0122: each build tier names the model it runs on.
--
-- A tier keeps its plain name ("Standard cloud model") and now also says which
-- model fills it ("Claude Opus 5.5"), set by an administrator on the admin page
-- and shown in the desktop app. The three seeded tiers are given the models the
-- owner named; a tier that already says what it runs on is left alone.
--
-- Additive: one new column, defaulting to empty, and the save function taking
-- it. Existing rows keep every value they had. Safe to run twice.

begin;

alter table public.build_models
	add column if not exists runs_on text not null default ''
	check (char_length(runs_on) <= 80);

update public.build_models set runs_on = 'Qwen3.6 35B A3B', updated_at = now()
where model_id = 'qwen-local' and runs_on = '';

update public.build_models set runs_on = 'Claude Opus 5.5', updated_at = now()
where model_id = 'claude-opus' and runs_on = '';

update public.build_models set runs_on = 'Claude Fable 5.1', updated_at = now()
where model_id = 'claude-fable' and runs_on = '';

drop function if exists public.admin_save_build_model(text, text, integer, integer);

create or replace function public.admin_save_build_model(
	new_model_id text, new_label text, new_runs_on text,
	new_least_points integer, new_most_points integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	perform public.assert_admin();
	insert into build_models (model_id, label, runs_on, least_points, most_points)
	values (new_model_id, new_label, new_runs_on, new_least_points, new_most_points)
	on conflict (model_id) do update
	set label = excluded.label, runs_on = excluded.runs_on,
		least_points = excluded.least_points, most_points = excluded.most_points,
		updated_at = now();
end;
$$;

commit;

notify pgrst, 'reload schema';
