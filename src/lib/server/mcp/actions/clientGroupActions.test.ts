import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientGroupActions } from './clientGroupActions';
import { emptyCompanyProfile } from '$lib/server/clients/companyProfile';
import { noSuchClient } from './describeClient';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const groupId = '22222222-2222-4222-8222-222222222222';
const unknownId = '33333333-3333-4333-8333-333333333333';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

const { clients, companiesHouse, grouped, officersImported } = vi.hoisted(() => ({
	clients: new Map<string, unknown>(),
	companiesHouse: { isConfigured: true },
	grouped: vi.fn(),
	officersImported: vi.fn()
}));

vi.mock('$lib/server/clients/getClient', () => ({ getClient: async (_supabase: unknown, clientId: string) => clients.get(clientId) ?? null }));
vi.mock('$lib/server/clients/groupClientsUnder', () => ({ groupClientsUnder: grouped }));
vi.mock('$lib/server/clients/importCompanyOfficers', () => ({ importCompanyOfficers: officersImported }));
vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));

const acme = { id: acmeId, name: 'Acme Roofing', profile: { ...emptyCompanyProfile, companyNumber: '12345678' } };
const bigGroup = { id: groupId, name: 'Big Group', profile: { ...emptyCompanyProfile } };

function run(name: string, input: Record<string, unknown>) {
	const action = clientGroupActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('grouping clients and importing their officers through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clients.clear();
		clients.set(acmeId, acme);
		clients.set(groupId, bigGroup);
		companiesHouse.isConfigured = true;
		grouped.mockResolvedValue(groupId);
	});

	it('puts a client under a parent already on the register', async () => {
		expect(await run('group_client_under', { clientId: acmeId, parentClientId: groupId })).toBe(
			`Acme Roofing is grouped under Big Group — client ${groupId}.`
		);
		expect(grouped).toHaveBeenCalledWith(staff.supabase, [acmeId], { existingParentId: groupId }, 'staff-1');
	});

	it('creates a new parent when one is named', async () => {
		expect(await run('group_client_under', { clientId: acmeId, newParentName: ' Big Group ' })).toContain(`client ${groupId}`);
		expect(grouped).toHaveBeenCalledWith(staff.supabase, [acmeId], { newParentName: 'Big Group' }, 'staff-1');
	});

	it('asks for one parent, and refuses a parent or a client nobody has', async () => {
		expect(await run('group_client_under', { clientId: acmeId })).toContain('not both');
		expect(await run('group_client_under', { clientId: acmeId, parentClientId: groupId, newParentName: 'Big Group' })).toContain('not both');
		expect(await run('group_client_under', { clientId: acmeId, parentClientId: unknownId })).toContain('has that parentClientId');
		expect(await run('group_client_under', { clientId: unknownId, parentClientId: groupId })).toBe(noSuchClient);
		expect(grouped).not.toHaveBeenCalled();
	});

	it("adds a client's officers from Companies House and counts them", async () => {
		officersImported.mockResolvedValue({ importedCount: 2, alreadyListedCount: 1 });
		expect(await run('import_company_officers', { clientId: acmeId })).toBe('2 officer(s) added at Acme Roofing, 1 already listed.');
		expect(officersImported).toHaveBeenCalledWith(staff.supabase, acme, 'staff-1');
	});

	it('needs a company number and a configured Companies House before asking', async () => {
		expect(await run('import_company_officers', { clientId: groupId })).toContain('Record the company number first');
		companiesHouse.isConfigured = false;
		expect(await run('import_company_officers', { clientId: acmeId })).toContain('Companies House is not configured');
		expect(officersImported).not.toHaveBeenCalled();
	});
});
