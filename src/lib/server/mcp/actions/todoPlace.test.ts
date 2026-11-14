import { describe, expect, it, vi } from 'vitest';
import { chooseTodoPlace, nobodyOwnsRefusal, ownerNotAColleague } from './todoPlace';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$lib/server/members/getPeopleIWorkWith', () => ({
	getPeopleIWorkWith: async () => [{ id: 'katie', name: 'Katie', email: 'katie@example.com' }]
}));

const caller = { accountId: 'james', supabase: {} } as unknown as McpCaller;
const ownList = { projectId: null, taskId: null };

describe('where a to-do with no task goes', () => {
	it('goes on the caller’s own list when nobody else is named', async () => {
		expect(await chooseTodoPlace(caller, { title: 'Door code' })).toEqual({ ...ownList, ownerAccountId: 'james' });
	});

	it('goes on the own list of someone the caller works with, named by email or id', async () => {
		const byEmail = await chooseTodoPlace(caller, { title: 'Door code', owner: 'katie@example.com' });
		expect(byEmail).toEqual({ ...ownList, ownerAccountId: 'katie' });
		expect(await chooseTodoPlace(caller, { title: 'Door code', owner: 'katie' })).toEqual(byEmail);
	});

	it('refuses someone the caller does not work with, and nobody without a task', async () => {
		expect(await chooseTodoPlace(caller, { title: 'Door code', owner: 'stranger@example.com' })).toBe(ownerNotAColleague);
		expect(await chooseTodoPlace(caller, { title: 'Door code', owner: 'nobody' })).toBe(nobodyOwnsRefusal);
	});
});
