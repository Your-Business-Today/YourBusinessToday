import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { seatControlLimits } from '$lib/data/boardroomSeatControlRules';
import { allSeatSettings } from '$lib/data/boardroomSeatControls';

const migration = readFileSync('migrations/0187_boardroom_seat_controls.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const ownTables = ['boardroom_steer_notes', 'boardroom_seat_settings', 'boardroom_held_contributions', 'boardroom_held_contribution_answers'];

describe('the seat controls migration keeps what each director tells their own Claude', () => {
	it('creates only tables of its own, named boardroom', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(ownTables);
	});

	it('refuses every update and delete of a note, a setting, a held piece and an answer, whoever asks', () => {
		for (const table of ownTables) expect(statements).toContain(`before insert or update or delete on public.${table}`);
		expect(statements).toContain("if tg_op <> 'INSERT' then");
		expect(statements).not.toMatch(/for (update|delete|all)/);
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('holds a paused Claude silent beside 0185’s rule, and leaves that rule as 0185 made it', () => {
		expect(statements).toContain('create or replace trigger boardroom_contributions_wait_while_paused\n\tbefore insert on public.boardroom_contributions');
		expect(statements).not.toContain('boardroom_contributions_are_kept');
	});

	it('reads each row only under the reader’s own sitting seat', () => {
		const ownSeatPolicies = statements.match(/public\.boardroom_is_own_sitting_seat\(director_id\)/g) ?? [];
		expect(ownSeatPolicies.length).toBe(6);
		expect(statements).toContain('where id = seat and account_id = auth.uid() and stood_down_at is null');
	});

	it('holds the same limits and settings as the service', () => {
		expect(statements).toContain(`char_length(words) between 1 and ${seatControlLimits.longestSteerNote}`);
		expect(statements).toContain(`setting in (${allSeatSettings.map((setting) => `'${setting}'`).join(', ')})`);
	});
});
