import { beforeEach, describe, expect, it, vi } from 'vitest';
import { areaMapActions } from './areaMapActions';
import { areaSearchRefusals } from '$lib/data/areaSearch';
import { mapFailedMessage, unknownPostcodeMessage } from '$lib/server/clients/area/areaOutcome';
import type { McpCaller } from '../resolveMcpCaller';
import { pageNumberRefusal, pinsPerPage } from './areaMapPages';

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
		expect(mapping).toHaveBeenCalledWith(staff.supabase, { postcode: 'SW1A 1AA', radiusMiles: 3, businessTypeKeys: [], sicCodes: [] });
	});

	it('searches as asked, and says when Companies House is not searched', async () => {
		mapping.mockResolvedValue({ centre, radiusMiles: 10, pins: [acme], companiesHouseHits: 0, isSearchedOnCompaniesHouse: false });
		const answer = String(await run({ postcode: 'SW1A 1AA', radiusMiles: 10, sicCodes: '43210, 43220' }));
		expect(answer).toContain('1 company within 10 miles of SW1A 1AA, all from our register — 1 already on the register.');
		expect(answer).toContain('COMPANIES_HOUSE_API_KEY');
		expect(mapping).toHaveBeenCalledWith(staff.supabase, { postcode: 'SW1A 1AA', radiusMiles: 10, businessTypeKeys: [], sicCodes: ['43210', '43220'] });
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

	it('lists a wide map a page at a time, nearest first, and says which page lists the next', async () => {
		const pinCount = pinsPerPage * 2 + 5;
		const pins = Array.from({ length: pinCount }, (_, index) => pin({ key: `${index}`, name: `Company ${index + 1}`, distanceMiles: index / 100 }));
		mapping.mockResolvedValue({ centre, radiusMiles: 5, pins, companiesHouseHits: pinCount, isSearchedOnCompaniesHouse: true });
		const firstLines = String(await run({ postcode: 'SW1A 1AA', radiusMiles: 5 })).split('\n');
		expect(firstLines).toHaveLength(pinsPerPage + 2);
		expect(firstLines[1]).toBe(`Page 1 of 3: companies 1 to ${pinsPerPage}, nearest first. pageNumber 2 lists the next ${pinsPerPage}. Choose SIC codes or a smaller radius to narrow the map.`);
		expect(firstLines[2]).toContain('Company 1 —');
		const lastLines = String(await run({ postcode: 'SW1A 1AA', radiusMiles: 5, pageNumber: 3 })).split('\n');
		expect(lastLines).toHaveLength(5 + 2);
		expect(lastLines[1]).toBe(`Page 3 of 3: companies ${pinsPerPage * 2 + 1} to ${pinCount}, nearest first. Choose SIC codes or a smaller radius to narrow the map.`);
		expect(await run({ postcode: 'SW1A 1AA', radiusMiles: 5, pageNumber: 4 })).toBe(`The map lists 3 pages of up to ${pinsPerPage} companies; pageNumber 4 is past the last.`);
	});

	it('refuses a page that is not a whole number from 1, and maps nothing', async () => {
		expect(await run({ postcode: 'SW1A 1AA', pageNumber: 0 })).toBe(pageNumberRefusal);
		expect(await run({ postcode: 'SW1A 1AA', pageNumber: 1.5 })).toBe(pageNumberRefusal);
		expect(await run({ postcode: 'SW1A 1AA', pageNumber: 'two' })).toBe(pageNumberRefusal);
		expect(mapping).not.toHaveBeenCalled();
	});
});
