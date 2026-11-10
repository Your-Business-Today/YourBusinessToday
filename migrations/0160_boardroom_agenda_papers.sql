-- 0160: an agenda item carries its papers, a file or a written note.
--
-- A sitting director attaches a paper to an item on one of their board's
-- meetings through their Claude:
--
--   boardroom_agenda_papers   one paper: its title, and either the note as
--                             written or the file's name, type, size and where
--                             it is stored, with the seat that added it.
--
-- A note is kept as soon as it is written. A file row is the upload link
-- granted for it until the file arrives; recorded_at and byte_count are set
-- once it has, and only then do the directors see it. The files are kept in
-- the private boardroom-papers bucket under the organisation's id, at most
-- 25 MB each and only of the kinds a board reads (PDF, Word, Excel,
-- PowerPoint, text, CSV, Markdown, PNG and JPEG); the bucket and the column
-- hold the same list as src/lib/data/boardroomPaperRules.ts.
--
-- Every sitting director of the organisation reads its papers, through
-- is_boardroom_director from 0153, and nobody else does. The connector writes
-- them through the service role after its own director check, so no policy
-- lets anyone write. A paper goes only on an item still standing on a meeting
-- that has not closed, and once kept it is never changed. Nothing deletes a
-- paper: no delete policy, no cascade, and a meeting, an item or a seat with a
-- paper on record cannot be deleted either (on delete restrict).
--
-- Additive and safe to re-run; nothing reads this table on a path every
-- request runs.

begin;

create unique index if not exists boardroom_meetings_of_organisation
	on public.boardroom_meetings (id, organisation_id);
create unique index if not exists boardroom_agenda_items_of_meeting
	on public.boardroom_agenda_items (id, meeting_id);

create table if not exists public.boardroom_agenda_papers (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null,
	kind text not null check (kind in ('file', 'note')),
	title text not null check (char_length(title) between 1 and 200),
	note text check (char_length(note) between 1 and 20000),
	filename text check (char_length(filename) between 1 and 255),
	mime_type text check (mime_type in (
		'application/pdf',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'text/plain',
		'text/csv',
		'text/markdown',
		'image/png',
		'image/jpeg'
	)),
	byte_count bigint check (byte_count between 1 and 26214400),
	storage_path text unique,
	added_by_director_id uuid not null,
	added_by uuid references auth.users (id) on delete set null,
	expires_at timestamptz,
	recorded_at timestamptz,
	created_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (added_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict,
	check (
		(kind = 'note'
			and note is not null and filename is null and mime_type is null and byte_count is null
			and storage_path is null and expires_at is null and recorded_at is not null)
		or (kind = 'file'
			and note is null and filename is not null and mime_type is not null
			and storage_path is not null and expires_at is not null
			and (recorded_at is null) = (byte_count is null))
	)
);

create index if not exists boardroom_agenda_papers_by_meeting
	on public.boardroom_agenda_papers (meeting_id, created_at);

create or replace function public.boardroom_papers_keep_to_their_meeting()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if tg_op = 'UPDATE' then
		if old.recorded_at is not null
			or new.recorded_at is null
			or (to_jsonb(new) - 'recorded_at' - 'byte_count') <> (to_jsonb(old) - 'recorded_at' - 'byte_count')
		then
			raise exception 'A board paper is kept as it was added; only a file''s arrival is recorded on it.';
		end if;
		return new;
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

create or replace trigger boardroom_papers_keep_to_their_meeting
	before insert or update on public.boardroom_agenda_papers
	for each row execute function public.boardroom_papers_keep_to_their_meeting();

alter table public.boardroom_agenda_papers enable row level security;

drop policy if exists "directors read their board's papers" on public.boardroom_agenda_papers;
create policy "directors read their board's papers" on public.boardroom_agenda_papers
	for select using (public.is_boardroom_director(organisation_id));

grant select on public.boardroom_agenda_papers to authenticated;
grant select, insert, update on public.boardroom_agenda_papers to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('boardroom-papers', 'boardroom-papers', false, 26214400, array[
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'text/plain',
	'text/csv',
	'text/markdown',
	'image/png',
	'image/jpeg'
])
on conflict (id) do nothing;

drop policy if exists "directors read their board's paper files" on storage.objects;
create policy "directors read their board's paper files" on storage.objects
	for select using (
		bucket_id = 'boardroom-papers'
		and exists (
			select 1 from public.boardroom_agenda_papers
			where boardroom_agenda_papers.storage_path = storage.objects.name
				and boardroom_agenda_papers.recorded_at is not null
				and public.is_boardroom_director(boardroom_agenda_papers.organisation_id)
		)
	);

commit;

notify pgrst, 'reload schema';
