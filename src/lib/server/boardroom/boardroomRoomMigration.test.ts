import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardRoomLimits } from '$lib/data/boardroomRoomRules';
import { contributionStances } from '$lib/data/boardroomRoom';

const migration = readFileSync('migrations/0185_boardroom_room.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the room migration keeps everything said', () => {
	it('creates only tables of its own, named boardroom', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['boardroom_rooms', 'boardroom_contributions', 'boardroom_item_outcomes']);
	});

	it('refuses every update and delete of a room, a contribution and an outcome, whoever asks', () => {
		for (const table of ['boardroom_rooms', 'boardroom_contributions', 'boardroom_item_outcomes']) {
			expect(statements).toContain(`before insert or update or delete on public.${table}`);
		}
		expect(statements.match(/if tg_op <> 'INSERT' then/g)?.length).toBe(3);
		expect(statements).not.toMatch(/for (insert|update|delete|all)/);
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('opens the meeting with its room, and keeps when it opened', () => {
		expect(statements).toContain('set opened_at = coalesce(opened_at, new.opened_at)');
		expect(statements).toContain('old.opened_at is not null and new.opened_at is distinct from old.opened_at');
	});

	it('holds a seat to one turn a round, and the same limits and stances as the service', () => {
		expect(statements).toMatch(/on public\.boardroom_contributions \(agenda_item_id, director_id, round\)\s+where corrects_id is null/);
		expect(statements).toContain(`char_length(words) between 1 and ${boardRoomLimits.longestWords}`);
		expect(statements).toContain(`char_length(wording) between 1 and ${boardRoomLimits.longestWording}`);
		expect(statements).toContain(`rounds_limit between 1 and ${boardRoomLimits.mostRounds}`);
		expect(statements).toContain(`stance in (${contributionStances.map((stance) => `'${stance}'`).join(', ')})`);
	});
});
