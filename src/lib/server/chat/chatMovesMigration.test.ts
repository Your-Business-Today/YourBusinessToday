import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatMoveLimits, chatMoveRefusals } from '$lib/data/chat/chatMoveRules';

const migration = readFileSync('migrations/0273_moving_chat_messages_between_rooms.sql', 'utf8');

describe('migration 0273, moving messages between rooms, and the limit and refusals the site checks', () => {
	it('holds the same limit as the rules, on the column and in the function', () => {
		expect(migration).toContain(`check (message_count between 1 and ${chatMoveLimits.mostMessagesInOneMove})`);
		expect(migration).toContain(`if chosen_count > ${chatMoveLimits.mostMessagesInOneMove} then`);
	});

	it('refuses in the function in the very words the site refuses in', () => {
		const missing = Object.values(chatMoveRefusals).filter((refusal) => !migration.includes(`raise exception '${refusal}';`));
		expect(missing).toEqual([]);
	});

	it('ties both rooms of a move to its organisation, never lets either go, and keeps the mover with no foreign key', () => {
		expect(migration).toContain('foreign key (from_room_id, organisation_id)\n\t\treferences public.chat_rooms (id, organisation_id) on delete restrict');
		expect(migration).toContain('foreign key (to_room_id, organisation_id)\n\t\treferences public.chat_rooms (id, organisation_id) on delete restrict');
		expect(migration).toMatch(/moved_by uuid not null,\n/);
	});

	it('changes only a moved message’s room and its move, keeping its words, author and time', () => {
		expect(migration).toContain('set room_id = to_room, moved_by_move_id = the_move.id\n');
		expect(migration).not.toMatch(/set [^;]*\b(body|author_account_id|created_at)\s*=/);
	});

	it('lets a reply and the message it answers sit in different rooms of the same organisation', () => {
		expect(migration).toContain('foreign key (reply_to_message_id, organisation_id)\n\t\treferences public.chat_messages (id, organisation_id)');
		expect(migration).toContain("like 'FOREIGN KEY (reply_to_message_id, room_id)%'");
	});

	it('lets the organisation’s people read the moves, no policy write, and only the service role move', () => {
		expect(migration).toContain("on public.chat_moves\n\tfor select using (public.can_use_organisation_module(organisation_id, 'chat'))");
		expect(migration).not.toMatch(/create policy[^;]*\bfor (all|insert|update|delete)\b/);
		expect(migration).toContain('from public, anon, authenticated;\ngrant execute on function public.move_chat_messages(uuid, uuid, uuid, uuid, uuid[]) to service_role;');
	});

	it('only adds: it drops no table or column, deletes no row and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b/);
		expect(migration).toContain("set local lock_timeout = '5s';");
		expect(migration).toContain('create table if not exists public.chat_moves');
		expect(migration).toContain('add column if not exists moved_by_move_id uuid');
	});
});
