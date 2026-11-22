import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from '$lib/server/mcp/actionRegistry';
import { actionAudiences } from '$lib/server/mcp/actionTypes';
import { publishedSkillAreas } from './publishedSkills';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const administrator = {
	accountId: 'administrator',
	email: 'administrator@example.test',
	isAdmin: true,
	isStaff: true,
	ownedProjectIds: [],
	memberProjectIds: [],
	organisationMemberships: []
};

describe('publishedSkillAreas', () => {
	it('puts the accounts first, so the books are reviewed first', () => {
		const [firstArea] = publishedSkillAreas();
		expect(firstArea.label).toBe('Accounts');
		expect(firstArea.skillCount).toBeGreaterThan(0);
	});

	it('publishes every skill every account follows and none kept for staff', () => {
		const publishedNames = publishedSkillAreas().flatMap((area) => area.skills.map((skill) => skill.name));
		const everyoneNames = actionsFor(administrator, null)
			.filter((action) => action.audience === actionAudiences.everyone)
			.map((action) => action.name);
		expect(new Set(publishedNames)).toEqual(new Set(everyoneNames));
	});
});
