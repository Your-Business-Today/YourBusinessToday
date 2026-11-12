import { beforeEach, describe, expect, it, vi } from 'vitest';
import { organisationWriteActions } from './organisationWriteActions';
import { noSuchOrganisation } from '../organisationAccess';
import type { McpCaller } from '../resolveMcpCaller';

const organisationId = '11111111-1111-4111-8111-111111111111';
const staff = { accountId: 'staff-1', isStaff: true, organisationMemberships: [], supabase: {} } as unknown as McpCaller;

const { organisations, removal } = vi.hoisted(() => ({
	organisations: { found: null as { id: string; name: string } | null },
	removal: vi.fn()
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({ getOrganisation: async () => organisations.found }));
vi.mock('$lib/server/organisations/deleteOrganisation', () => ({ deleteOrganisation: removal }));
vi.mock('$lib/data/organisationAccess', () => ({ reachesOrganisation: () => true, managesOrganisation: () => false }));

function run(name: string, input: Record<string, unknown>) {
	const action = organisationWriteActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('deleting an organisation through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		organisations.found = { id: organisationId, name: 'Acme Ltd' };
		removal.mockResolvedValue(null);
	});

	it('deletes the organisation and says its projects stay', async () => {
		expect(await run('delete_organisation', { organisationId })).toBe('Acme Ltd deleted. Its projects stay, under no organisation.');
		expect(removal).toHaveBeenCalledWith(staff.supabase, organisationId);
	});

	it('refuses an id that is not a record id, and one no organisation has, before deleting anything', async () => {
		expect(await run('delete_organisation', { organisationId: 'acme' })).toContain('organisationId');
		organisations.found = null;
		expect(await run('delete_organisation', { organisationId })).toBe(noSuchOrganisation);
		expect(removal).not.toHaveBeenCalled();
	});

	it('passes on the refusal when the organisation still holds records that are always kept', async () => {
		removal.mockResolvedValue('This organisation still holds records that are always kept, so it was not deleted.');
		expect(await run('delete_organisation', { organisationId })).toContain('still holds records that are always kept');
	});

	it('is a staff write', () => {
		const action = organisationWriteActions.find((candidate) => candidate.name === 'delete_organisation');
		expect(action?.audience).toBe('staff');
		expect(action?.isWrite).toBe(true);
	});
});
