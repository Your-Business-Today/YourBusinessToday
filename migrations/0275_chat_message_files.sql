-- 0275: A director takes a photo on site with their phone, or picks a document,
-- and shares it in a room, as they do on WhatsApp today.
--
-- chat_message_files holds one row per file a message carries: the message
-- (tied to a message of the same organisation by a composite key, on delete
-- restrict, so a message with a file is never deleted), where the file is kept
-- in storage (unique, so a file is on one message only), its name (1 to 200
-- characters), its kind (up to 120 characters) and its size (1 byte to 25 MB),
-- as storage measured them when the message was posted, never as the browser
-- said. A message carries at most 5 files. Nothing said is ever edited or
-- deleted, and neither is a file: no policy lets anyone change a row.
--
-- chat-files is the private bucket the files are kept in, at most 25 MB each,
-- of the kinds the chat keeps: pictures (JPEG, PNG, WebP, GIF, HEIC) and the
-- documents a project already keeps (PDF, Word, Excel, PowerPoint, text, CSV,
-- Markdown). No policy opens it: the site signs a short-lived link to send each
-- file to, under the organisation and the sender, and a short-lived link to
-- fetch it, for a reader the module rule lets in. A file sent and never put on
-- a message stays in the bucket, as an upload whose link lapsed does elsewhere,
-- and is shown nowhere, since only a row here names a file to anyone.
--
-- A message may now carry files and no words. The check on chat_messages.body
-- is widened from 1 to 4000 characters to at most 4000: first the wider check
-- is added, then the narrower one 0272 made is dropped. Only that constraint
-- goes; no column, row or table does. The rule that a message with no words
-- must carry a file cannot be a plain check, since it looks across two tables,
-- so it is kept in the one service that posts, validateChatMessage and
-- postChatMessage, and in post_chat_message_with_files below.
--
-- post_chat_message_with_files writes a message and its file rows in one step,
-- so a message is never seen without its files: it refuses no file, or more
-- than 5, inserts the message (so the bell's trigger tells the organisation, as
-- for any message) and then each file in the order given, each a moment after
-- the one before, so the room shows them in that order. The service role alone may call it; the
-- site calls it after its own checks of the room and of each file as stored.
--
-- A move (0273) sets only a message's room and its move, and a file is tied to
-- its message alone, never to a room, so a moved message keeps its files.
--
-- The limits mirror src/lib/data/chat/chatFileRules.ts, which the site checks
-- before anything is written, and the function refuses in the same words.
--
-- That organisation's people read the files by the one module rule. No policy
-- lets the app write. Adds only: one table, two indexes, a bucket, a check in
-- place of a narrower one and a function. No row is updated. The new key takes
-- a short lock on chat_messages, so the lock timeout gives up in seconds
-- rather than queue the live site behind it.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.chat_message_files (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	message_id uuid not null,
	storage_path text not null unique,
	file_name text not null check (char_length(file_name) between 1 and 200),
	content_type text not null check (char_length(content_type) between 1 and 120),
	size_bytes bigint not null check (size_bytes between 1 and 26214400),
	created_at timestamptz not null default now(),
	foreign key (message_id, organisation_id)
		references public.chat_messages (id, organisation_id) on delete restrict
);

create index if not exists chat_message_files_by_message
	on public.chat_message_files (message_id);

create index if not exists chat_message_files_by_organisation
	on public.chat_message_files (organisation_id);

alter table public.chat_message_files enable row level security;

drop policy if exists "people read the chat files of their organisations" on public.chat_message_files;
create policy "people read the chat files of their organisations" on public.chat_message_files
	for select using (public.can_use_organisation_module(organisation_id, 'chat'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-files', 'chat-files', false, 26214400,
	array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv'])
on conflict (id) do nothing;

alter table public.chat_messages drop constraint if exists chat_messages_words_fit;
alter table public.chat_messages add constraint chat_messages_words_fit
	check (char_length(body) <= 4000);

alter table public.chat_messages drop constraint if exists chat_messages_body_check;

create or replace function public.post_chat_message_with_files(organisation uuid, room uuid, author uuid, words text, via text, files jsonb)
returns public.chat_messages
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
	file_count integer;
	the_message public.chat_messages;
begin
	file_count := coalesce(jsonb_array_length(files), 0);
	if file_count = 0 then
		raise exception 'Say something, or attach at least one file.';
	end if;
	if file_count > 5 then
		raise exception 'A message carries at most 5 files.';
	end if;
	insert into public.chat_messages (organisation_id, room_id, author_account_id, body, posted_via)
	values (organisation, room, author, words, via)
	returning * into the_message;
	insert into public.chat_message_files (organisation_id, message_id, storage_path, file_name, content_type, size_bytes, created_at)
	select organisation, the_message.id, sent.file ->> 'storage_path', sent.file ->> 'file_name', sent.file ->> 'content_type',
		(sent.file ->> 'size_bytes')::bigint, clock_timestamp()
	from jsonb_array_elements(files) with ordinality as sent (file, place)
	order by sent.place;
	return the_message;
end;
$$;

revoke all on function public.post_chat_message_with_files(uuid, uuid, uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.post_chat_message_with_files(uuid, uuid, uuid, text, text, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
