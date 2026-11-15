import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0245_boardroom_turn_calls.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the turn calls migration keeps each turn a director was emailed for, once', () => {
	it('creates one table of its own, keyed by the item, the seat and the round', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['boardroom_turn_calls']);
		expect(statements).toContain('primary key (agenda_item_id, director_id, round)');
	});

	it('refuses every update and delete of a call, whoever asks, and drops nothing', () => {
		expect(statements).toContain('before insert or update or delete on public.boardroom_turn_calls');
		expect(statements).toContain("if tg_op <> 'INSERT' then");
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('lets no signed-in reader or writer at the calls: only the service role writes them', () => {
		expect(statements).toContain('alter table public.boardroom_turn_calls enable row level security;');
		expect(statements).not.toMatch(/create policy/i);
	});
});
