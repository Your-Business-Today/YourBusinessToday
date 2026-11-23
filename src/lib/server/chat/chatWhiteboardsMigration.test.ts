import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatWhiteboardLimits } from '$lib/data/chat/chatWhiteboardRules';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { chatWhiteboardsTable, openedWhiteboardColumns } from './chatWhiteboardRecord';

const migration = readFileSync('migrations/0278_chat_room_whiteboards.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const { longestTitle, mostItemsOnABoard, largestDrawingBytes } = chatWhiteboardLimits;

describe('migration 0278, the whiteboards of a room, and the limits the site checks', () => {
	it('holds the same title length, most items and most bytes as the rules, with every column the site reads', () => {
		expect(statements).toContain(`check (char_length(title) between 1 and ${longestTitle})`);
		expect(statements).toContain(`then jsonb_array_length(strokes) <= ${mostItemsOnABoard} and octet_length(strokes::text) <= ${largestDrawingBytes}`);
		expect(statements).toContain("case when jsonb_typeof(strokes) = 'array'");
		for (const column of openedWhiteboardColumns.split(', ')) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
	});

	it('ties a board to a room of the same organisation, never lets the room go, and keeps a board in its place', () => {
		expect(statements).toContain('foreign key (room_id, organisation_id)\n\t\treferences public.chat_rooms (id, organisation_id) on delete restrict');
		expect(statements).toContain('new.room_id <> old.room_id');
		expect(statements).toContain('before update on public.chat_whiteboards');
	});

	it("lets the organisation's people read the boards by the module rule, with no policy to write", () => {
		expect(statements).toContain(`on public.${chatWhiteboardsTable}\n\tfor select using (public.can_use_organisation_module(organisation_id, 'chat'))`);
		expect(statements).not.toMatch(/for (all|insert|update|delete)\b/);
		expect(tablesKeptByOrganisation).toContain(chatWhiteboardsTable);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '5s';");
		expect(statements).toContain(`create table if not exists public.${chatWhiteboardsTable}`);
	});
});
