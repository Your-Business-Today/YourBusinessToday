-- 0274: A person's own Claude reads the chat rooms over the connector as that
-- person, so what is unread is counted for a reader the connector names, by
-- the same rule the site counts by.
--
-- The connector runs as the service role, for which auth.uid() is nobody, so
-- chat_unread_counts (0272) could only ever count for the signed-in visitor.
-- The rule now lives in one place, chat_unread_messages_for_reader: the
-- messages of an organisation's rooms newer than the reader's place in the
-- room they are in now, and not the reader's own; a room never opened counts
-- every message not theirs. chat_unread_counts_for_reader counts them room by
-- room. Both take the reader by account id, so the service role alone may call
-- them, after the connector's own check that the reader may use the chat.
--
-- chat_unread_counts keeps its name, input and answer, so the site goes on
-- calling it unchanged: it now counts through the same rule for auth.uid(). It
-- runs as its owner to reach that rule, so it asks the module rule itself, as
-- the policies on chat_messages and chat_room_reads asked it before; a visitor
-- who may not use the organisation's chat is told of nothing.
--
-- Nothing reads or writes a row here: no read marker moves and no
-- notification is marked read. Adds only: two functions, and one function
-- redefined with the same answer. No table is touched.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create or replace function public.chat_unread_messages_for_reader(organisation uuid, reader uuid)
returns table (message_id uuid, room_id uuid, created_at timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
	select message.id, message.room_id, message.created_at
	from public.chat_messages message
	left join public.chat_room_reads room_read
		on room_read.room_id = message.room_id and room_read.account_id = reader
	where message.organisation_id = organisation
		and message.author_account_id <> reader
		and (room_read.read_up_to is null or message.created_at > room_read.read_up_to);
$$;

revoke all on function public.chat_unread_messages_for_reader(uuid, uuid) from public, anon, authenticated;
grant execute on function public.chat_unread_messages_for_reader(uuid, uuid) to service_role;

create or replace function public.chat_unread_counts_for_reader(organisation uuid, reader uuid)
returns table (room_id uuid, unread_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
	select unread.room_id, count(*)
	from public.chat_unread_messages_for_reader(organisation, reader) unread
	group by unread.room_id;
$$;

revoke all on function public.chat_unread_counts_for_reader(uuid, uuid) from public, anon, authenticated;
grant execute on function public.chat_unread_counts_for_reader(uuid, uuid) to service_role;

create or replace function public.chat_unread_counts(organisation uuid)
returns table (room_id uuid, unread_count bigint)
language sql
stable
security definer
set search_path = public
as $$
	select counted.room_id, counted.unread_count
	from public.chat_unread_counts_for_reader(organisation, auth.uid()) counted
	where public.can_use_organisation_module(organisation, 'chat');
$$;

revoke all on function public.chat_unread_counts(uuid) from public, anon;
grant execute on function public.chat_unread_counts(uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
