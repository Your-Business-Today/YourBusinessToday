-- 0245: a director is emailed when it is their turn in a board meeting.
--
--   boardroom_turn_calls   one row for each turn a director was called to by
--                          email: the agenda item, the director's seat and the
--                          round. A turn opens when the room opens, or when the
--                          last seat in a round has spoken and the next round
--                          begins. The row is kept before the email is sent,
--                          and the key refuses a second row for the same turn,
--                          so no turn is ever emailed twice.
--
-- The connector and the site write these rows with the service role, as they
-- say pieces in the room (speakOnBoardroomItem.ts, answerHeldContribution.ts),
-- so no policy lets a signed-in reader or writer at them. Nothing is edited or
-- deleted: a call is kept as it was made.
--
-- Additive and safe to re-run; the code that writes here skips the emails
-- until this table exists. No foreign key to an account; nothing is deleted
-- by a cascade.

begin;

create table if not exists public.boardroom_turn_calls (
	agenda_item_id uuid not null,
	director_id uuid not null,
	round integer not null check (round >= 1),
	organisation_id uuid not null,
	meeting_id uuid not null,
	called_at timestamptz not null default now(),
	primary key (agenda_item_id, director_id, round),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_turn_calls_by_meeting
	on public.boardroom_turn_calls (meeting_id, called_at);

create or replace function public.boardroom_turn_calls_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A director''s call to their turn is kept as it was made.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_turn_calls_are_kept
	before insert or update or delete on public.boardroom_turn_calls
	for each row execute function public.boardroom_turn_calls_are_kept();

alter table public.boardroom_turn_calls enable row level security;

commit;

notify pgrst, 'reload schema';
