-- 0175: every question asked through a chatbot onto Your Business Brain is
-- kept on record, so the organisation can prove what was and was not asked.
--
--   business_brain_chatbot_questions   each question, in the words the person's
--                                      Claude gave, with who asked and when
--   business_brain_chatbot_readings    each reading made for it through the
--                                      chatbot, as Your Business Today saw it:
--                                      what was asked, what came back, or why
--                                      it was refused
--   business_brain_chatbot_answers     the answer the person's Claude reports
--                                      it gave, with the pages it cited
--
-- Your Business Today calls no AI model, so it sees the readings for itself
-- and is told the answer: the two are kept in tables of their own so the
-- record always says which is which. A question with no answer row is an
-- exchange whose answer was never reported.
--
-- The asker is kept as they were at the time: their account id and the email
-- they signed in with, with no foreign key, so the record outlives the account.
--
-- Nothing here is ever changed or deleted: a trigger refuses every update and
-- every delete, whoever makes it, and no policy lets anyone insert, change or
-- delete a row from the app. The connector writes the rows. A manager of the
-- organisation, or staff, with the module on, reads them. Every row carries
-- its organisation and chatbot, and the foreign keys include them, so a
-- reading or an answer can never sit under another chatbot's question.
-- Nothing is deleted by a cascade: the record is kept for as long as the
-- organisation's Your Business Brain is kept. The limits match
-- chatbotTrailLimits (businessBrainChatbotTrailRules.ts).
--
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.business_brain_chatbot_questions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	chatbot_id uuid not null,
	asked_by uuid not null,
	asked_by_email text not null check (char_length(asked_by_email) between 3 and 320 and asked_by_email = lower(asked_by_email)),
	question text not null check (char_length(question) between 1 and 2000),
	asked_at timestamptz not null default now(),
	unique (id, organisation_id, chatbot_id),
	foreign key (chatbot_id, organisation_id)
		references public.business_brain_chatbots (id, organisation_id) on delete restrict
);

create table if not exists public.business_brain_chatbot_readings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	chatbot_id uuid not null,
	question_id uuid not null,
	reading text not null check (reading in ('index', 'search', 'page')),
	question text not null check (char_length(question) between 1 and 2000),
	search_words text check (char_length(search_words) <= 200),
	part_kind text check (part_kind in ('expertise', 'experience', 'process', 'people')),
	page_id uuid,
	revision_id bigint,
	outcome text not null check (outcome in ('given', 'nothing_found', 'refused')),
	refusal text check (char_length(refusal) <= 2000),
	pages_given jsonb not null default '[]'::jsonb check (jsonb_typeof(pages_given) = 'array'),
	read_at timestamptz not null default now(),
	check ((outcome = 'refused') = (refusal is not null)),
	foreign key (question_id, organisation_id, chatbot_id)
		references public.business_brain_chatbot_questions (id, organisation_id, chatbot_id) on delete restrict
);

create table if not exists public.business_brain_chatbot_answers (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	chatbot_id uuid not null,
	question_id uuid not null unique,
	answered_by uuid not null,
	answered_by_email text not null check (char_length(answered_by_email) between 3 and 320 and answered_by_email = lower(answered_by_email)),
	answer text not null check (char_length(answer) between 1 and 20000),
	pages_cited jsonb not null default '[]'::jsonb check (jsonb_typeof(pages_cited) = 'array' and jsonb_array_length(pages_cited) <= 50),
	answered_at timestamptz not null default now(),
	foreign key (question_id, organisation_id, chatbot_id)
		references public.business_brain_chatbot_questions (id, organisation_id, chatbot_id) on delete restrict
);

create index if not exists business_brain_chatbot_questions_by_organisation
	on public.business_brain_chatbot_questions (organisation_id, asked_at desc);
create index if not exists business_brain_chatbot_questions_by_chatbot
	on public.business_brain_chatbot_questions (chatbot_id, asked_at desc);
create index if not exists business_brain_chatbot_questions_by_email
	on public.business_brain_chatbot_questions (organisation_id, asked_by_email);
create index if not exists business_brain_chatbot_readings_by_question
	on public.business_brain_chatbot_readings (question_id, read_at);

create or replace function public.business_brain_chatbot_trail_is_kept()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	raise exception 'The record of questions asked through a chatbot is kept as it was written; nothing in it is changed or deleted.';
end;
$$;

create or replace trigger business_brain_chatbot_questions_are_kept
	before update or delete on public.business_brain_chatbot_questions
	for each row execute function public.business_brain_chatbot_trail_is_kept();

create or replace trigger business_brain_chatbot_readings_are_kept
	before update or delete on public.business_brain_chatbot_readings
	for each row execute function public.business_brain_chatbot_trail_is_kept();

create or replace trigger business_brain_chatbot_answers_are_kept
	before update or delete on public.business_brain_chatbot_answers
	for each row execute function public.business_brain_chatbot_trail_is_kept();

alter table public.business_brain_chatbot_questions enable row level security;
alter table public.business_brain_chatbot_readings enable row level security;
alter table public.business_brain_chatbot_answers enable row level security;

drop policy if exists "managers with the module read the questions asked" on public.business_brain_chatbot_questions;
create policy "managers with the module read the questions asked" on public.business_brain_chatbot_questions
	for select using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "managers with the module read what was read for them" on public.business_brain_chatbot_readings;
create policy "managers with the module read what was read for them" on public.business_brain_chatbot_readings
	for select using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

drop policy if exists "managers with the module read the answers reported" on public.business_brain_chatbot_answers;
create policy "managers with the module read the answers reported" on public.business_brain_chatbot_answers
	for select using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

commit;

notify pgrst, 'reload schema';
