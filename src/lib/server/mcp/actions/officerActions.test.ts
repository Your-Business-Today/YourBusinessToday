import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noOfficerMatched } from './describeOfficers';
import { officerActions } from './officerActions';
import type { McpCaller } from '../resolveMcpCaller';

const samId = '11111111-1111-4111-8111-111111111111';
const samsOfficerId = 'abc123officer';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

const { companiesHouse, officersFound, personEnsured } = vi.hoisted(() => ({
	companiesHouse: { isConfigured: true },
	officersFound: vi.fn(),
	personEnsured: vi.fn()
}));

vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));
vi.mock('$lib/server/companiesHouse/searchOfficers', () => ({ searchOfficers: officersFound }));
vi.mock('$lib/server/people/ensurePersonForOfficer', () => ({ ensurePersonForOfficer: personEnsured }));

function run(name: string, input: Record<string, unknown>) {
	const action = officerActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('finding officers on Companies House through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		companiesHouse.isConfigured = true;
	});

	it('finds officers by name and lists them as the People page does, with the id to add them by', async () => {
		officersFound.mockResolvedValue([{ officerId: samsOfficerId, name: 'Sam Rivers', appointmentCount: 2, bornIn: '05/1978', addressSnippet: 'Manchester' }]);
		expect(await run('search_officers', { query: 'Sam Rivers' })).toBe(`Sam Rivers — 2 appointments — born 05/1978 — Manchester — officer ${samsOfficerId}`);
		officersFound.mockResolvedValue([]);
		expect(await run('search_officers', { query: 'Nobody' })).toBe(noOfficerMatched);
	});

	it('says when Companies House is not configured, and asks for a name before searching', async () => {
		expect(await run('search_officers', { query: '  ' })).toContain('Give the name');
		companiesHouse.isConfigured = false;
		expect(await run('search_officers', { query: 'Sam' })).toContain('Companies House is not configured');
		expect(officersFound).not.toHaveBeenCalled();
	});

	it('adds an officer as a person, or gives back the one already held', async () => {
		personEnsured.mockResolvedValue(samId);
		expect(await run('add_officer_as_person', { officerId: samsOfficerId, name: 'Sam Rivers' })).toContain(`person ${samId}`);
		expect(personEnsured).toHaveBeenCalledWith(staff.supabase, { officerId: samsOfficerId, name: 'Sam Rivers' });
		expect(await run('add_officer_as_person', { officerId: '', name: 'Sam Rivers' })).toBe('An officer is required.');
		expect(personEnsured).toHaveBeenCalledTimes(1);
	});
});
