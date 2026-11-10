-- 0162: a board paper can be taken from the company's own records.
--
-- A sitting director chooses, for an agenda item, something Your Business
-- Today already holds for the organisation, and the reading is kept as it
-- stood at that moment:
--
--   boardroom_record_papers   one paper: where it was read from (a report of
--                             the books, a project's progress or a page of
--                             Your Business Brain), what was asked of it (the
--                             days, the cost centre, the project or the page)
--                             and the reading itself, word for word, with the
--                             moment it was taken.
--
-- The reading is a copy, so the minutes always match what the board saw;
-- nothing in the books, the project or Your Business Brain is changed by
-- taking it. Once kept, a paper is never changed or deleted: a trigger
-- refuses both, whoever asks. The project and the page are named by id
-- without a foreign key, so the paper stands whatever later becomes of them.
--
-- Every sitting director reads the papers of their board, through
-- is_boardroom_director from 0153; a paper read from Books or from Your
-- Business Brain is read only through that module's rule as well, by
-- can_use_organisation_module from 0145. The connector writes them through
-- the service role after its own checks, so no policy lets anyone write.
--
-- Additive and safe to re-run; nothing reads this table on a path every
-- request runs, and its readers answer empty until it exists.

begin;

create table if not exists public.boardroom_record_papers (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null,
	source text not null check (source in (
		'trial_balance',
		'profit_and_loss',
		'balance_sheet',
		'project_progress',
		'business_brain_page'
	)),
	title text not null check (char_length(title) between 1 and 200),
	period_start date,
	period_end date,
	cost_centre_id uuid,
	record_id uuid,
	reading text not null check (char_length(reading) between 1 and 200000),
	taken_at timestamptz not null,
	added_by_director_id uuid not null,
	added_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (added_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict,
	check (
		(source in ('trial_balance', 'balance_sheet')
			and period_end is not null and period_start is null and cost_centre_id is null and record_id is null)
		or (source = 'profit_and_loss'
			and period_start is not null and period_end is not null and record_id is null)
		or (source in ('project_progress', 'business_brain_page')
			and record_id is not null and period_start is null and period_end is null and cost_centre_id is null)
	)
);

create index if not exists boardroom_record_papers_by_meeting
	on public.boardroom_record_papers (meeting_id, created_at);

create or replace function public.boardroom_record_papers_keep_as_taken()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A board paper is kept as it stood when it was taken; it is never changed or deleted.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) = 'closed' then
		raise exception 'This board meeting has closed; its papers are kept as they stood.';
	end if;
	if exists (
		select 1 from public.boardroom_agenda_items
		where id = new.agenda_item_id and withdrawn_at is not null
	) then
		raise exception 'A paper goes only on an agenda item that has not been withdrawn.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_record_papers_keep_as_taken
	before insert or update or delete on public.boardroom_record_papers
	for each row execute function public.boardroom_record_papers_keep_as_taken();

alter table public.boardroom_record_papers enable row level security;

drop policy if exists "directors read their board's record papers" on public.boardroom_record_papers;
create policy "directors read their board's record papers" on public.boardroom_record_papers
	for select using (
		public.is_boardroom_director(organisation_id)
		and case
			when source in ('trial_balance', 'profit_and_loss', 'balance_sheet')
				then public.can_use_organisation_module(organisation_id, 'books')
			when source = 'business_brain_page'
				then public.can_use_organisation_module(organisation_id, 'business_brain')
			else true
		end
	);

grant select on public.boardroom_record_papers to authenticated;
grant select, insert on public.boardroom_record_papers to service_role;

commit;

notify pgrst, 'reload schema';
