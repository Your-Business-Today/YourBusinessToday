import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0274_chat_unread_for_a_named_reader.sql', 'utf8');
const readerFunctions = ['chat_unread_messages_for_reader(uuid, uuid)', 'chat_unread_counts_for_reader(uuid, uuid)'];

describe('migration 0274, unread counted for a reader the connector names', () => {
	it('states the unread rule once, and counts from it for the site and the connector alike', () => {
		expect(migration.match(/room_read\.read_up_to is null or message\.created_at > room_read\.read_up_to/g)).toHaveLength(1);
		expect(migration).toContain('from public.chat_unread_messages_for_reader(organisation, reader) unread');
		expect(migration).toContain('from public.chat_unread_counts_for_reader(organisation, auth.uid()) counted');
	});

	it('lets the service role alone count for a named reader', () => {
		for (const readerFunction of readerFunctions) {
			expect(migration).toContain(`revoke all on function public.${readerFunction} from public, anon, authenticated;`);
			expect(migration).toContain(`grant execute on function public.${readerFunction} to service_role;`);
		}
	});

	it("keeps the site's count behind the module rule now that it runs as its owner", () => {
		expect(migration).toContain("where public.can_use_organisation_module(organisation, 'chat');");
		expect(migration).toContain('grant execute on function public.chat_unread_counts(uuid) to authenticated, service_role;');
	});

	it('only adds functions: it touches no table and no row, and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\b(drop|alter|create) table\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\.|\binsert into\b/);
		expect(migration).toContain("set local lock_timeout = '5s';");
	});
});
