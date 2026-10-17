-- 0116: the models that build and review coding tasks, set once in admin.
--
-- Each build model takes the tasks whose story points fall in its range: the
-- local model on the Mac mini the easy ones, Claude Opus the middle, Fable the
-- hardest. One of them reviews what the local model builds before its pull
-- request opens; that choice is the review_model site setting. Every signed-in
-- person can read both, so the desktop app and the review skill follow them;
-- only an administrator changes them, through the admin_* functions.
--
-- Additive: one new table and one new setting row. Safe to run twice.

begin;

create table if not exists public.build_models (
	model_id text primary key check (model_id ~ '^[a-z0-9][a-z0-9.:_-]{0,79}$'),
	label text not null check (char_length(label) between 1 and 80),
	least_points integer not null check (least_points in (1, 2, 3, 5, 8, 13, 21)),
	most_points integer not null check (most_points in (1, 2, 3, 5, 8, 13, 21)),
	updated_at timestamptz not null default now(),
	constraint build_model_range_runs_upward check (least_points <= most_points)
);

alter table public.build_models enable row level security;

drop policy if exists "signed in people read the build models" on public.build_models;
create policy "signed in people read the build models" on public.build_models
	for select to authenticated using (true);

insert into public.build_models (model_id, label, least_points, most_points) values
	('qwen-local', 'Qwen on the Mac mini', 1, 2),
	('claude-opus', 'Claude Opus', 3, 8),
	('claude-fable', 'Fable', 13, 21)
on conflict (model_id) do nothing;

insert into public.site_settings (setting_name, setting_value)
values ('review_model', 'claude-opus')
on conflict (setting_name) do nothing;

create or replace function public.admin_save_build_model(
	new_model_id text, new_label text, new_least_points integer, new_most_points integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	perform public.assert_admin();
	insert into build_models (model_id, label, least_points, most_points)
	values (new_model_id, new_label, new_least_points, new_most_points)
	on conflict (model_id) do update
	set label = excluded.label, least_points = excluded.least_points,
		most_points = excluded.most_points, updated_at = now();
end;
$$;

create or replace function public.admin_remove_build_model(old_model_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	perform public.assert_admin();
	if exists (
		select 1 from site_settings
		where setting_name = 'review_model' and setting_value = old_model_id
	) then
		raise exception 'The review model cannot be removed; choose another reviewer first.';
	end if;
	delete from build_models where model_id = old_model_id;
end;
$$;

create or replace function public.admin_set_review_model(new_model_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	perform public.assert_admin();
	if not exists (select 1 from build_models where model_id = new_model_id) then
		raise exception 'The review model must be one of the build models.';
	end if;
	update site_settings
	set setting_value = new_model_id, updated_at = now()
	where setting_name = 'review_model';
end;
$$;

create or replace function public.read_review_model()
returns text
language sql
stable
security definer
set search_path = public
as $$
	select setting_value from site_settings where setting_name = 'review_model';
$$;

grant execute on function public.read_review_model() to authenticated;

commit;

notify pgrst, 'reload schema';
