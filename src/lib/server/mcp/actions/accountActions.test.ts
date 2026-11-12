import { beforeEach, describe, expect, it, vi } from 'vitest';
import { accountActions } from './accountActions';
import { displayNameMaxLength, displayNameTooLong } from '$lib/data/displayNameRules';
import type { McpCaller } from '../resolveMcpCaller';

const { profile, nameSaved } = vi.hoisted(() => ({ profile: { displayName: '' }, nameSaved: vi.fn() }));

vi.mock('$lib/server/auth/getDisplayNameOf', () => ({ getDisplayNameOf: async () => profile.displayName }));
vi.mock('$lib/server/auth/saveDisplayNameFor', () => ({ saveDisplayNameFor: nameSaved }));

const james = {
	accountId: 'james-1',
	email: 'james@example.com',
	isAdmin: true,
	isStaff: true,
	ownedProjectIds: ['p1', 'p2'],
	memberProjectIds: ['p3'],
	supabase: {}
} as unknown as McpCaller;

function run(name: string, input: Record<string, unknown>) {
	const action = accountActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(james, input);
}

describe('the account through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		profile.displayName = 'James';
	});

	it('says who the caller is, with the name they go by', async () => {
		expect(await run('who_am_i', {})).toBe('Email: james@example.com\nName: James\nStanding: administrator\nProjects: 2 owned, 1 as a team member');
		profile.displayName = '';
		expect(await run('who_am_i', {})).toContain('Name: not set, so your email is shown');
	});

	it('changes the name they go by, or clears it', async () => {
		expect(await run('set_display_name', { displayName: ' James B ' })).toBe('You now go by James B.');
		expect(nameSaved).toHaveBeenCalledWith(james.supabase, 'james-1', 'James B');
		expect(await run('set_display_name', { displayName: '' })).toContain('cleared');
		expect(nameSaved).toHaveBeenCalledWith(james.supabase, 'james-1', '');
	});

	it('refuses a name longer than its column before writing', async () => {
		expect(await run('set_display_name', { displayName: 'x'.repeat(displayNameMaxLength + 1) })).toBe(displayNameTooLong);
		expect(nameSaved).not.toHaveBeenCalled();
	});
});
