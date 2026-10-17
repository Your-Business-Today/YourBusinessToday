-- 0120: a task raised anyway, despite open tasks that look like it, asks each of
-- their raisers to review it.
--
-- One row per open task that looked like the new one. Its raiser answers keep
-- both, merge (the new task's details go onto theirs and the new task closes) or
-- replace (their task closes, pointing at the new one). The new task can sit on a
-- project the reviewer cannot reach, so the answer is applied by
-- answer_similar_task_review, which checks the reviewer first. A signed-in person
-- is always the one answering; the connector, which calls with the service key,
-- names the account it acts for.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.similar_task_reviews (
	id uuid primary key default gen_random_uuid(),
	existing_task_id uuid not null references public.tasks (id) on delete cascade,
	new_task_id uuid not null references public.tasks (id) on delete cascade,
	new_task_title text not null,
	new_project_name text not null,
	reviewer_account_id uuid not null references auth.users (id) on delete cascade,
	raised_by uuid not null references auth.users (id) on delete cascade,
	decision text check (decision in ('keep_both', 'merge', 'replace')),
	decided_at timestamptz,
	created_at timestamptz not null default now(),
	unique (existing_task_id, new_task_id)
);

alter table public.similar_task_reviews enable row level security;

drop policy if exists "reviewers and raisers read their reviews" on public.similar_task_reviews;
create policy "reviewers and raisers read their reviews" on public.similar_task_reviews
	for select using (reviewer_account_id = auth.uid() or raised_by = auth.uid());

drop policy if exists "raisers ask about tasks they can reach" on public.similar_task_reviews;
create policy "raisers ask about tasks they can reach" on public.similar_task_reviews
	for insert with check (
		raised_by = auth.uid()
		and exists (
			select 1 from public.tasks as task
			where task.id = existing_task_id and public.can_reach_project(task.project_id)
		)
		and exists (
			select 1 from public.tasks as task
			where task.id = new_task_id and public.can_reach_project(task.project_id)
		)
	);

create or replace function public.close_reviewed_task(closed_task uuid, closed_by uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	update public.tasks
	set status = 'done', completion_percent = 100, status_set_by = closed_by
	where id = closed_task;
$$;

revoke all on function public.close_reviewed_task(uuid, uuid) from public, anon, authenticated;

create or replace function public.answer_similar_task_review(review_id uuid, answer text, acting_account uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	reviewer uuid := coalesce(auth.uid(), acting_account);
	review public.similar_task_reviews;
	existing_title text;
	new_details text;
begin
	select * into review from public.similar_task_reviews where id = review_id;
	if review.id is null or reviewer is null or review.reviewer_account_id <> reviewer then
		raise exception 'No such review is waiting on you.';
	end if;
	if review.decision is not null then
		raise exception 'This review was already answered.';
	end if;
	if answer is null or answer not in ('keep_both', 'merge', 'replace') then
		raise exception 'A review is answered keep_both, merge or replace.';
	end if;
	select title into existing_title from public.tasks where id = review.existing_task_id;
	select details into new_details from public.tasks where id = review.new_task_id;

	if answer = 'merge' then
		update public.tasks
		set details = concat_ws(
			E'\n\n',
			nullif(details, ''),
			format('Merged from "%s" on %s: %s', review.new_task_title, review.new_project_name, coalesce(new_details, ''))
		)
		where id = review.existing_task_id;
		insert into public.conversation_messages (task_id, author_account_id, body, posted_via)
		values (
			review.new_task_id,
			reviewer,
			format('Merged into "%s", which now carries this task''s details, so this task is closed.', existing_title),
			'site'
		);
		perform public.close_reviewed_task(review.new_task_id, reviewer);
	end if;

	if answer = 'replace' then
		perform public.close_reviewed_task(review.existing_task_id, reviewer);
	end if;

	insert into public.conversation_messages (task_id, author_account_id, body, posted_via)
	values (
		review.existing_task_id,
		reviewer,
		case answer
			when 'keep_both' then format('Keeping both: "%s" on %s stays a task of its own.', review.new_task_title, review.new_project_name)
			when 'merge' then format('Merged "%s" on %s into this task and closed it.', review.new_task_title, review.new_project_name)
			when 'replace' then format('Replaced by "%s" on %s, so this task is closed.', review.new_task_title, review.new_project_name)
		end,
		'site'
	);

	update public.similar_task_reviews set decision = answer, decided_at = now() where id = review.id;
	return answer;
end;
$$;

revoke all on function public.answer_similar_task_review(uuid, text, uuid) from public, anon;
grant execute on function public.answer_similar_task_review(uuid, text, uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
