import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { organisationModules } from '$lib/data/organisationModules';
import { chatRoomLimits as limits } from '$lib/data/chat/chatRoomRules';

const migration = readFileSync('migrations/0270_organisation_chat_rooms.sql', 'utf8');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

describe('migration 0270, Chat and its rooms, and the limits the site checks', () => {
	it('lets every module be switched on, chat among them', () => {
		expect(migration).toContain(`check (module in (${quotedList(organisationModules)}))`);
	});

	it('holds the same lengths as the rules', () => {
		expect(migration).toContain(`char_length(name) between 1 and ${limits.longestName}`);
		expect(migration).toContain(`char_length(purpose) <= ${limits.longestPurpose}`);
	});

	it('keeps one General room, and different names among the rooms sharing a parent that are not archived', () => {
		expect(migration).toContain('on public.chat_rooms (organisation_id)\n\twhere is_general;');
		expect(migration).toContain('(organisation_id, parent_room_id, lower(name)) nulls not distinct\n\twhere archived_at is null;');
		expect(migration).toContain('never under another subroom');
	});

	it("lets the organisation's people read the rooms by the module rule, and no policy lets the app write", () => {
		expect(migration).toContain("for select using (public.can_use_organisation_module(organisation_id, 'chat'))");
		expect(migration).not.toMatch(/for (all|insert|update|delete)\b/);
	});

	it('only adds: it drops no table or column, updates no row and gives up on a lock in seconds', () => {
		expect(migration).not.toMatch(/\bdrop (table|column)\b/);
		expect(migration).not.toMatch(/\bdelete from\b|\bupdate public\./);
		expect(migration).toContain("set local lock_timeout = '5s';");
	});
});
