import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatSummaryLimits } from '$lib/data/chat/chatSummaryRules';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { chatSummariesTable, chatSummaryColumns } from './chatSummaryRecord';

const migration = readFileSync('migrations/0276_chat_room_catch_up_summaries.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

describe('migration 0276, the catch-ups of a room, and the limits the site checks', () => {
	it('holds the same length and ways of writing as the rules, with every column the site reads', () => {
		expect(statements).toContain(`check (char_length(words) between 1 and ${chatSummaryLimits.longestWords})`);
		expect(statements).toContain(`default '${postedViaChannels.claude}' check (written_via in (${quotedList(Object.values(postedViaChannels))}))`);
		for (const column of chatSummaryColumns.split(', ')) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
	});

	it('ties a catch-up to a room of the same organisation, never lets the room go, and keeps the writer with no foreign key', () => {
		expect(statements).toContain('foreign key (room_id, organisation_id)\n\t\treferences public.chat_rooms (id, organisation_id) on delete restrict');
		expect(statements).toContain('written_by_account_id uuid not null,\n');
		expect(statements).toContain(`on public.${chatSummariesTable} (room_id, created_at desc)`);
	});

	it("lets the organisation's people read the catch-ups by the module rule, with no policy to write", () => {
		expect(statements).toContain(`on public.${chatSummariesTable}\n\tfor select using (public.can_use_organisation_module(organisation_id, 'chat'))`);
		expect(statements).not.toMatch(/for (all|insert|update|delete)\b/);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '5s';");
		expect(statements).toContain(`create table if not exists public.${chatSummariesTable}`);
	});
});
