import { beforeEach, describe, expect, it, vi } from 'vitest';
import { areaMapActions } from './areaMapActions';
import { areaSearchRefusals } from '$lib/data/areaSearch';
import { mapFailedMessage, unknownPostcodeMessage } from '$lib/server/clients/area/areaOutcome';
import type { McpCaller } from '../resolveMcpCaller';

const clientId = '11111111-1111-4111-8111-111111111111';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

const { mapping } = vi.hoisted(() => ({ mapping: vi.fn() }));
vi.mock('$lib/server/clients/area/mapArea', () => ({ mapArea: mapping }));

const centre = { postcode: 'SW1A 1AA', outcode: 'SW1A', latitude: 51.5, longitude: -0.14 };
const pin = (facts: Record<string, unknown>) => ({
	key: 'k', companyNumber: '', name: '', address: '', postcode: '', incorporatedOn: '', sicCodes: [], latitude: 51.5, longitude: -0.14,
	distanceMiles: 0.4, standing: null, companyCount: 1, isNonTrading: false, isSighting: false, isPremises: false, isPlace: false, statusNote: '', ...facts
});
const acme = pin({ key: '12345678', companyNumber: '12345678', name: 'Acme Ltd', address: '1 High Street', incorporatedOn: '2019-03-04', sicCodes: ['43210'], distanceMiles: 0.4, standing: { clientId, stage: 'lead' } });
const hub = pin({ key: 'hub', name: 'Registered Office Services', address: '2 Hub Road', distanceMiles: 1.26, companyCount: 40 });

function run(input: Record<string, unknown>) {
	const [action] = areaMapActions;
	return action.run(staff, input);
}

describe('the area map through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mapping.mockResolvedValue({ centre, radiusMiles: 3, pins: [acme, hub], companiesHouseHits: 2, isSearchedOnCompaniesHouse: true });
	});

	it('lists the companies nearest first as the map does, with our standing and how to reach each', async () => {
		expect(await run({ postcode: 'sw1a1aa' })).toBe(
			[
				'2 companies within 3 miles of SW1A 1AA — 1 already on the register.',
				`Acme Ltd — 1 High Street — 0.4 mi — Lead — SIC 43210 — incorporated 2019-03-04 — company 12345678 — client ${clientId}`,
				'Registered Office Services — 2 Hub Road — 1.3 mi — Registered-office hub — holding 40 companies'
			].join('\n')
		);
		expect(mapping).toHaveBeenCalledWith(staff.supabase, { postcode: 'SW1A 1AA', radiusMiles: 3, sicCodes: [] });
	});

	it('searches as asked, and says when Companies House is not searched', async () => {
		mapping.mockResolvedValue({ centre, radiusMiles: 10, pins: [acme], companiesHouseHits: 0, isSearchedOnCompaniesHouse: false });
		const answer = String(await run({ postcode: 'SW1A 1AA', radiusMiles: 10, sicCodes: '43210, 43220' }));
		expect(answer).toContain('1 company within 10 miles of SW1A 1AA, all from our register — 1 already on the register.');
		expect(answer).toContain('COMPANIES_HOUSE_API_KEY');
		expect(mapping).toHaveBeenCalledWith(staff.supabase, { postcode: 'SW1A 1AA', radiusMiles: 10, sicCodes: ['43210', '43220'] });
	});

	it('refuses a search that does not fit rather than correcting it, and passes on the page’s notices', async () => {
		expect(await run({ postcode: 'nowhere' })).toBe(areaSearchRefusals.postcode);
		expect(await run({ postcode: 'SW1A 1AA', radiusMiles: 4 })).toBe(areaSearchRefusals.radiusMiles);
		expect(await run({ postcode: 'SW1A 1AA', sicCodes: '4321' })).toBe(areaSearchRefusals.sicCodes);
		expect(mapping).not.toHaveBeenCalled();
		mapping.mockResolvedValue(null);
		expect(await run({ postcode: 'SW1A 1AA' })).toBe(unknownPostcodeMessage);
		mapping.mockRejectedValue(new Error('down'));
		expect(await run({ postcode: 'SW1A 1AA' })).toBe(mapFailedMessage);
	});
});
