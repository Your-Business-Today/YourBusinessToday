import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientProfileActions } from './clientProfileActions';
import { emptyCompanyProfile } from '$lib/server/clients/companyProfile';
import { noSuchClient } from './describeClient';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const unknownId = '22222222-2222-4222-8222-222222222222';
const acmeProfile = { ...emptyCompanyProfile, industry: 'Roofing', companyNumber: '12345678' };
const acme = { id: acmeId, name: 'Acme Roofing', website: 'https://acme.example', profile: acmeProfile };

const { profileSaved } = vi.hoisted(() => ({ profileSaved: vi.fn() }));

vi.mock('$lib/server/clients/getClient', () => ({
	getClient: async (_supabase: unknown, clientId: string) => (clientId === acmeId ? acme : null)
}));
vi.mock('$lib/server/clients/updateCompanyProfile', () => ({ updateCompanyProfile: profileSaved }));

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

function run(input: Record<string, unknown>) {
	const [changeProfile] = clientProfileActions;
	return changeProfile.run(staff, input);
}

describe('changing a company profile through the connector', () => {
	beforeEach(() => vi.clearAllMocks());

	it('changes only the fields given and keeps the rest', async () => {
		expect(await run({ clientId: acmeId, location: 'Kingston', postcode: 'kt1 1aa' })).toBe("Acme Roofing's profile is saved.");
		const changedProfile = { ...acmeProfile, location: 'Kingston', postcode: 'KT1 1AA' };
		expect(profileSaved).toHaveBeenCalledWith(staff.supabase, acmeId, 'https://acme.example', changedProfile);
	});

	it('changes the website beside the profile', async () => {
		await run({ clientId: acmeId, website: 'https://acme-roofing.example' });
		expect(profileSaved).toHaveBeenCalledWith(staff.supabase, acmeId, 'https://acme-roofing.example', acmeProfile);
	});

	it('refuses a value that does not fit its column before writing', async () => {
		expect(await run({ clientId: acmeId, headcountBand: 'lots' })).toBe('The headcount band is one of 1-10, 11-50, 51-200, 201-500, 500+.');
		expect(await run({ clientId: acmeId, website: 'acme' })).toBe('The website must be a public web address, such as https://example.com.');
		expect(profileSaved).not.toHaveBeenCalled();
	});

	it('asks for something to change, and refuses a client nobody has', async () => {
		expect(await run({ clientId: acmeId })).toContain('Nothing was given to change');
		expect(await run({ clientId: unknownId, industry: 'Roofing' })).toBe(noSuchClient);
		expect(await run({ clientId: 'acme', industry: 'Roofing' })).toContain('The clientId must be an id');
		expect(profileSaved).not.toHaveBeenCalled();
	});
});
