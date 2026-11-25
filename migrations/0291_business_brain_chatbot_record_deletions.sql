-- 0291: a business deletes entries from its chatbot record, and sets how long
-- the record is kept, as the terms of 26 November 2026 say it can.
--
--   business_brain_chatbot_record_keeping    how many days the organisation keeps
--                                            its chatbot record; no row, or no
--                                            days, keeps it for as long as its
--                                            Your Business Brain is kept
--   business_brain_chatbot_record_deletions  one row for every question deleted
--                                            from the record: which chatbot, when
--                                            it was asked, when it was deleted,
--                                            by whom or because it had passed the
--                                            keeping period, but never its words
--
-- An entry is still never changed. The trigger 0175 put on the record's three
-- tables now lets a delete through only inside forget_chatbot_question, which
-- deletes the question with its readings and answer and records the deletion
-- in the same step. Two doors reach it:
--
--   delete_business_brain_chatbot_question   a manager of the organisation, or
--                                            staff, deletes one question, from
--                                            the site or through the connector
--   delete_chatbot_record_past_keeping       the overnight run deletes every
--                                            question older than its
--                                            organisation's keeping period
--
-- set_chatbot_record_keeping sets the period. Managers with the module read the
-- keeping period and the deletions; nobody writes either from the app except
-- through these functions, and nothing deletes or changes a deletion.
--
-- Additive and safe to re-run; the code that reads it stands without it. It
-- deletes nothing as it runs.

begin;

set local lock_timeout = '10s';
set local statement_timeout = '2min';

create table if not exists public.business_brain_chatbot_record_keeping (
	organisation_id uuid primary key references public.business_brains (organisation_id) on delete restrict,
	kept_days integer check (kept_days between 1 and 3650),
	set_by uuid not null,
	set_at timestamptz not null default now()
);

create table if not exists public.business_brain_chatbot_record_deletions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	chatbot_id uuid not null,
	question_id uuid not null,
	question_asked_at timestamptz not null,
	deleted_at timestamptz not null default now(),
	deleted_by uuid,
	deleted_by_email text check (char_length(deleted_by_email) between 3 and 320 and deleted_by_email = lower(deleted_by_email)),
	reason text not null check (reason in ('deleted_by_the_business', 'past_the_keeping_period')),
	check ((reason = 'deleted_by_the_business') = (deleted_by is not null)),
	foreign key (chatbot_id, organisation_id)
		references public.business_brain_chatbots (id, organisation_id) on delete restrict
);

create index if not exists business_brain_chatbot_record_deletions_by_chatbot
	on public.business_brain_chatbot_record_deletions (chatbot_id, deleted_at desc);
create index if not exists business_brain_chatbot_record_deletions_by_organisation
	on public.business_brain_chatbot_record_deletions (organisation_id, deleted_at desc);

create or replace function public.business_brain_chatbot_trail_is_kept()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if tg_op = 'DELETE' and current_setting('ybt.forgetting_chatbot_question', true) = 'yes' then
		return old;
	end if;
	raise exception 'The record of questions asked through a chatbot is kept as it was written: an entry is never changed, and only its business deletes one.';
end;
$$;

create or replace function public.business_brain_chatbot_deletions_are_kept()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	raise exception 'The record of deletions from a chatbot record is kept as it was written; nothing in it is changed or deleted.';
end;
$$;

create or replace trigger business_brain_chatbot_record_deletions_are_kept
	before update or delete on public.business_brain_chatbot_record_deletions
	for each row execute function public.business_brain_chatbot_deletions_are_kept();

create or replace function public.forget_chatbot_question(question_to_forget uuid, deleter uuid, why text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	asked public.business_brain_chatbot_questions%rowtype;
	deleter_email text;
begin
	select * into asked from public.business_brain_chatbot_questions where id = question_to_forget;
	if not found then
		raise exception 'No question with that id is on the chatbot record.';
	end if;
	select lower(email) into deleter_email from auth.users where id = deleter;
	perform set_config('ybt.forgetting_chatbot_question', 'yes', true);
	delete from public.business_brain_chatbot_answers where question_id = asked.id;
	delete from public.business_brain_chatbot_readings where question_id = asked.id;
	delete from public.business_brain_chatbot_questions where id = asked.id;
	perform set_config('ybt.forgetting_chatbot_question', '', true);
	insert into public.business_brain_chatbot_record_deletions
		(organisation_id, chatbot_id, question_id, question_asked_at, deleted_by, deleted_by_email, reason)
	values (asked.organisation_id, asked.chatbot_id, asked.id, asked.asked_at, deleter, deleter_email, why);
end;
$$;

revoke execute on function public.forget_chatbot_question(uuid, uuid, text) from public, anon, authenticated, service_role;

create or replace function public.delete_business_brain_chatbot_question(
	organisation uuid,
	question_to_delete uuid,
	member uuid default auth.uid()
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	is_connector boolean := auth.role() = 'service_role';
begin
	if member is null or (not is_connector and member is distinct from auth.uid()) then
		raise exception 'Only the person signed in deletes from a chatbot record.';
	end if;
	if not is_connector and not (
		public.can_use_organisation_module(organisation, 'business_brain')
		and public.can_manage_organisation(organisation)
	) then
		raise exception 'Only a manager of the organisation, or staff, deletes from its chatbot record.';
	end if;
	if not exists (
		select 1 from public.business_brain_chatbot_questions
		where id = question_to_delete and organisation_id = organisation
	) then
		raise exception 'No question with that id is on the organisation''s chatbot record.';
	end if;
	perform public.forget_chatbot_question(question_to_delete, member, 'deleted_by_the_business');
end;
$$;

revoke execute on function public.delete_business_brain_chatbot_question(uuid, uuid, uuid) from public, anon;
grant execute on function public.delete_business_brain_chatbot_question(uuid, uuid, uuid) to authenticated, service_role;

create or replace function public.set_chatbot_record_keeping(
	organisation uuid,
	days integer,
	member uuid default auth.uid()
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	is_connector boolean := auth.role() = 'service_role';
begin
	if member is null or (not is_connector and member is distinct from auth.uid()) then
		raise exception 'Only the person signed in sets how long a chatbot record is kept.';
	end if;
	if not is_connector and not (
		public.can_use_organisation_module(organisation, 'business_brain')
		and public.can_manage_organisation(organisation)
	) then
		raise exception 'Only a manager of the organisation, or staff, sets how long its chatbot record is kept.';
	end if;
	insert into public.business_brain_chatbot_record_keeping (organisation_id, kept_days, set_by, set_at)
	values (organisation, days, member, now())
	on conflict (organisation_id) do update
		set kept_days = excluded.kept_days, set_by = excluded.set_by, set_at = excluded.set_at;
end;
$$;

revoke execute on function public.set_chatbot_record_keeping(uuid, integer, uuid) from public, anon;
grant execute on function public.set_chatbot_record_keeping(uuid, integer, uuid) to authenticated, service_role;

create or replace function public.delete_chatbot_record_past_keeping(most_deleted integer default 5000)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	past record;
	deleted_count integer := 0;
begin
	for past in
		select question.id
		from public.business_brain_chatbot_questions question
		join public.business_brain_chatbot_record_keeping keeping using (organisation_id)
		where keeping.kept_days is not null
			and question.asked_at < now() - make_interval(days => keeping.kept_days)
		order by question.asked_at
		limit most_deleted
	loop
		perform public.forget_chatbot_question(past.id, null, 'past_the_keeping_period');
		deleted_count := deleted_count + 1;
	end loop;
	return deleted_count;
end;
$$;

revoke execute on function public.delete_chatbot_record_past_keeping(integer) from public, anon, authenticated;
grant execute on function public.delete_chatbot_record_past_keeping(integer) to service_role;

alter table public.business_brain_chatbot_record_keeping enable row level security;
alter table public.business_brain_chatbot_record_deletions enable row level security;

drop policy if exists "managers with the module read how long the record is kept" on public.business_brain_chatbot_record_keeping;
create policy "managers with the module read how long the record is kept" on public.business_brain_chatbot_record_keeping
	for select using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "managers with the module read what was deleted" on public.business_brain_chatbot_record_deletions;
create policy "managers with the module read what was deleted" on public.business_brain_chatbot_record_deletions
	for select using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

commit;

notify pgrst, 'reload schema';
