import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { boardBriefLimits } from '$lib/data/boardroomBriefRules';

const migration = readFileSync('migrations/0181_boardroom_briefs.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const policies = statements.split('create policy').slice(1).map((policy) => policy.split(';')[0]);
const ownSeatOnly = /boardroom_directors\.id = boardroom_briefs\.director_id\s+and boardroom_directors\.account_id = auth\.uid\(\)/;

describe('the briefs migration keeps each brief to its own director', () => {
	it('creates only a table of its own, named boardroom', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['boardroom_briefs']);
	});

	it('lets a director read and write only under their own seat, with no override for staff or administrators', () => {
		expect(policies.length).toBe(2);
		expect(policies[0]).toMatch(/for select using/);
		expect(policies[1]).toMatch(/for insert with check/);
		for (const policy of policies) {
			expect(policy).toMatch(ownSeatOnly);
			expect(policy).toContain('public.is_boardroom_director(organisation_id)');
			expect(policy).not.toMatch(/is_project_manager|is_admin|is_staff/);
		}
	});

	it('changes and deletes no version, whoever asks', () => {
		expect(statements).not.toMatch(/for (update|delete|all)/);
		expect(statements).toContain('before insert or update or delete on public.boardroom_briefs');
		expect(statements).toContain("if tg_op <> 'INSERT' then");
	});

	it('tells the other directors only whose brief is in, never what it says', () => {
		expect(statements).toContain('returns table (agenda_item_id uuid, director_id uuid)');
		expect(statements).toContain('select distinct boardroom_briefs.agenda_item_id, boardroom_briefs.director_id');
		expect(statements).toContain('revoke execute on function public.boardroom_briefs_in(uuid) from public, anon;');
	});

	it('holds the same limits as the service checks, and deletes nothing by a cascade', () => {
		for (const column of ['position', 'may_share', 'must_not_share', 'must_come_back']) {
			expect(statements).toContain(`char_length(${column}) between 1 and ${boardBriefLimits.longestPart}`);
		}
		expect(statements).not.toMatch(/on delete cascade/i);
		expect(statements).not.toMatch(/drop (table|column)/i);
	});
});
