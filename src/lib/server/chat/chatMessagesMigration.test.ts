import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatMessageLimits } from '$lib/data/chat/chatMessageRules';
import { postedViaChannels } from '$lib/data/conversationTurn';

const migration = readFileSync('migrations/0272_chat_room_messages.sql', 'utf8');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

describe('migration 0272, messages in a room and each person’s place in it, and the limits the site checks', () => {
	it('holds the same length and ways of posting as the rules', () => {
		expect(migration).toContain(`char_length(body) between 1 and ${chatMessageLimits.longestBody}`);
		expect(migration).toContain(`check (posted_via in (${quotedList(Object.values(postedViaChannels))}))`);
		expect(migration).toContain(`default '${postedViaChannels.site}'`);
	});

	it('ties a message to a room of the same organisation, never lets the room go, and answers only a message in that room', () => {
		expect(migration).toContain('foreign key (room_id, organisation_id)\n\t\treferences public.chat_rooms (id, organisation_id) on delete restrict');
		expect(migration).toContain('foreign key (reply_to_message_id, room_id)\n\t\treferences public.chat_messages (id, room_id)');
		expect(migration).toMatch(/author_account_id uuid not null,\n/);
	});

	it("lets the organisation's people read the messages, and each person only their own place, with no policy to write", () => {
		expect(migration).toContain("on public.chat_messages\n\tfor select using (public.can_use_organisation_module(organisation_id, 'chat'))");
		expect(migration).toContain("for select using (account_id = auth.uid() and public.can_use_organisation_module(organisation_id, 'chat'))");
		expect(migration).not.toMatch(/for (all|insert|update|delete)\b/);
	});

	it('counts as unread the messages newer than the reader’s place and not their own, every one in a room never opened', () => {
		expect(migration).toContain('and message.author_account_id <> auth.uid()');
		expect(migration).toContain('and (room_read.read_up_to is null or message.created_at > room_read.read_up_to)');
	});

	it('widens the one-subject check to a chat room and keeps one unread notification per person per room', () => {
		expect(migration).toContain('check (num_nonnulls(goal_id, task_id, chat_room_id) = 1)');
		expect(migration).toContain('on public.notifications (recipient_id, chat_room_id)\n\twhere chat_room_id is not null and not is_read;');
		expect(migration).toContain('on conflict (recipient_id, chat_room_id) where chat_room_id is not null and not is_read do nothing');
	});

	it('only adds: it drops no table or column, updates no row outside a function and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b/);
		expect(migration).toContain("set local lock_timeout = '5s';");
		expect(migration).toContain('create table if not exists public.chat_messages');
		expect(migration).toContain('create table if not exists public.chat_room_reads');
	});
});
