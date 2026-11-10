-- 0189: each decision is confirmed by the directors themselves, and recorded
-- with who agreed.
--
--   boardroom_decision_rules    how an organisation's own articles say a
--                               decision of its directors carries: the quorum,
--                               a majority or every director taking part, and
--                               whether the chair has a casting vote. Each
--                               rule recorded is kept; the latest is in force.
--                               An organisation with none decides by the model
--                               articles, which the service states.
--   boardroom_decisions         an agenda item for decision that came out of
--                               the room agreed (0185), put to the directors:
--                               its wording, the chair, the rule it is decided
--                               by as it stood when it was put, and the earlier
--                               decision it replaces when its proposal named one.
--   boardroom_decision_answers  one director's own answer to a decision: agrees,
--                               disagrees or abstains, with their reason if they
--                               gave one, who gave it and when.
--
-- A decision is opened only from an item's agreed outcome, with that outcome's
-- wording and proposal. An answer is taken only while the meeting is open, only
-- from a sitting director who was on the meeting, once each. Nothing here is
-- edited or deleted, whoever asks: a later meeting replaces a decision with a
-- new one naming it. Pausing a director's Claude (0187) silences the Claude,
-- not the director, so no pause rule sits on these tables.
--
-- boardroom_contributions and boardroom_held_contributions gain the decision a
-- proposal replaces, a new column beside their others; 0185's and 0187's rules
-- on them are left as they were made.
--
-- The connector and the site write every row through the service role after
-- their own director check, so no policy lets anyone write from the app. Every
-- director of the board reads every decision and answer. The account that
-- answered is kept with no foreign key, so the record outlives it (as 0185
-- does); nothing is deleted by a cascade (on delete restrict).
--
-- The limits are stated once beside the service in boardroomDecisionRules.ts.
-- Additive and safe to re-run; the code that reads these tables stands
-- without them.

begin;

create table if not exists public.boardroom_decision_rules (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	quorum integer not null check (quorum between 1 and 20),
	agreement text not null check (agreement in ('majority', 'unanimous')),
	chair_has_casting_vote boolean not null,
	articles_reference text not null check (char_length(articles_reference) between 1 and 500),
	recorded_by_director_id uuid not null,
	recorded_by uuid not null,
	recorded_at timestamptz not null default now(),
	foreign key (recorded_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_decision_rules_by_organisation
	on public.boardroom_decision_rules (organisation_id, recorded_at);

create table if not exists public.boardroom_decisions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null unique
		references public.boardroom_item_outcomes (agenda_item_id) on delete restrict,
	proposal_id uuid not null references public.boardroom_contributions (id) on delete restrict,
	wording text not null check (char_length(wording) between 1 and 2000),
	chair_director_id uuid not null,
	rule_source text not null check (rule_source in ('model_articles', 'own_articles')),
	quorum integer not null check (quorum between 1 and 20),
	agreement text not null check (agreement in ('majority', 'unanimous')),
	chair_has_casting_vote boolean not null,
	articles_reference text check (char_length(articles_reference) between 1 and 500),
	replaces_decision_id uuid references public.boardroom_decisions (id) on delete restrict,
	opened_by uuid not null,
	opened_at timestamptz not null default now(),
	check ((rule_source = 'own_articles') = (articles_reference is not null)),
	unique (id, meeting_id),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (chair_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_decisions_by_meeting
	on public.boardroom_decisions (meeting_id);

create index if not exists boardroom_decisions_by_replaced
	on public.boardroom_decisions (replaces_decision_id)
	where replaces_decision_id is not null;

create table if not exists public.boardroom_decision_answers (
	decision_id uuid not null,
	director_id uuid not null,
	organisation_id uuid not null,
	meeting_id uuid not null,
	answer text not null check (answer in ('agrees', 'disagrees', 'abstains')),
	reason text check (char_length(reason) between 1 and 2000),
	answered_by uuid not null,
	answered_at timestamptz not null default now(),
	primary key (decision_id, director_id),
	foreign key (decision_id, meeting_id)
		references public.boardroom_decisions (id, meeting_id) on delete restrict,
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

alter table public.boardroom_contributions
	add column if not exists replaces_decision_id uuid references public.boardroom_decisions (id) on delete restrict;

alter table public.boardroom_held_contributions
	add column if not exists replaces_decision_id uuid references public.boardroom_decisions (id) on delete restrict;

create or replace function public.boardroom_decision_rules_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A rule the directors recorded is kept as it was recorded; a change is a new rule.';
	end if;
	if not exists (
		select 1 from public.boardroom_directors
		where id = new.recorded_by_director_id and stood_down_at is null
	) then
		raise exception 'Only a sitting director records how the board''s decisions carry.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_decision_rules_are_kept
	before insert or update or delete on public.boardroom_decision_rules
	for each row execute function public.boardroom_decision_rules_are_kept();

create or replace function public.boardroom_decisions_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A decision is kept as it was put; a later meeting replaces it with a new decision naming it.';
	end if;
	if not exists (
		select 1 from public.boardroom_item_outcomes
		where agenda_item_id = new.agenda_item_id
			and outcome = 'agreed'
			and proposal_id = new.proposal_id
			and wording = new.wording
	) then
		raise exception 'A decision is put only with the wording its item came out of the room agreed.';
	end if;
	if new.replaces_decision_id is not null and not exists (
		select 1 from public.boardroom_decisions
		where id = new.replaces_decision_id
			and organisation_id = new.organisation_id
			and meeting_id <> new.meeting_id
	) then
		raise exception 'A decision replaces only a decision of the same board taken at an earlier meeting.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_decisions_are_kept
	before insert or update or delete on public.boardroom_decisions
	for each row execute function public.boardroom_decisions_are_kept();

create or replace function public.boardroom_decision_answers_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A director''s answer to a decision is kept as they gave it.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) <> 'open' then
		raise exception 'Directors answer a decision while its meeting is open.';
	end if;
	if not exists (
		select 1 from public.boardroom_directors director
		join public.boardroom_meetings meeting on meeting.id = new.meeting_id
		where director.id = new.director_id
			and director.stood_down_at is null
			and director.named_at <= meeting.meets_at
	) then
		raise exception 'Only a sitting director who was on the meeting answers its decisions.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_decision_answers_are_kept
	before insert or update or delete on public.boardroom_decision_answers
	for each row execute function public.boardroom_decision_answers_are_kept();

alter table public.boardroom_decision_rules enable row level security;
alter table public.boardroom_decisions enable row level security;
alter table public.boardroom_decision_answers enable row level security;

drop policy if exists "directors read how their board's decisions carry" on public.boardroom_decision_rules;
create policy "directors read how their board's decisions carry" on public.boardroom_decision_rules
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read their board's decisions" on public.boardroom_decisions;
create policy "directors read their board's decisions" on public.boardroom_decisions
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read every answer to their board's decisions" on public.boardroom_decision_answers;
create policy "directors read every answer to their board's decisions" on public.boardroom_decision_answers
	for select using (public.is_boardroom_director(organisation_id));

grant select on public.boardroom_decision_rules, public.boardroom_decisions, public.boardroom_decision_answers to authenticated;
grant select, insert on public.boardroom_decision_rules, public.boardroom_decisions, public.boardroom_decision_answers to service_role;

commit;

notify pgrst, 'reload schema';
