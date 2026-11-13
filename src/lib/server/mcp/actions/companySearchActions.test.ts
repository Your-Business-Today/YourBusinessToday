import { beforeEach, describe, expect, it, vi } from 'vitest';
import { companySearchActions } from './companySearchActions';
import { noCompanyMatched } from './describeCompanySearch';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

const { companiesHouse, pageFound, leadAdded, officersImported } = vi.hoisted(() => ({
	companiesHouse: { isConfigured: true },
	pageFound: vi.fn(),
	leadAdded: vi.fn(),
	officersImported: vi.fn()
}));

vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));
vi.mock('$lib/server/companiesHouse/searchCompaniesHouse', () => ({ searchCompaniesHousePage: pageFound }));
vi.mock('$lib/server/clients/addProspectAsLead', () => ({ addProspectAsLead: leadAdded }));
vi.mock('$lib/server/clients/importCompanyOfficers', () => ({ importCompanyOfficers: officersImported }));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: async () => ({ id: acmeId, name: 'Acme Roofing' }) }));

const acmeOnTheRegister = {
	companyNumber: '12345678',
	name: 'ACME ROOFING LTD',
	incorporatedOn: '2019-03-04',
	dissolvedOn: '',
	companyStatus: 'active',
	address: '1 High Street, Kingston upon Thames, KT1 1AA',
	postcode: 'KT1 1AA',
	sicCodes: ['43910']
};
const acmeLine = 'ACME ROOFING LTD — company number 12345678 — active — incorporated 4 Mar 2019 — 1 High Street, Kingston upon Thames, KT1 1AA — SIC 43910';

function run(name: string, input: Record<string, unknown>) {
	const action = companySearchActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('finding companies on Companies House and adding them as leads through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		companiesHouse.isConfigured = true;
	});

	it('searches by SIC code and place and lists the page as the prospect table does', async () => {
		pageFound.mockResolvedValue({ companies: [acmeOnTheRegister], totalHits: 7 });
		expect(await run('search_companies_house', { sicCodes: '43910, 41202', location: 'Kingston' })).toBe(`7 match(es); the first 1:\n${acmeLine}`);
		expect(pageFound).toHaveBeenCalledWith({ sicCodes: ['43910', '41202'], location: 'Kingston' }, 50);
		pageFound.mockResolvedValue({ companies: [], totalHits: 0 });
		expect(await run('search_companies_house', { location: 'Nowhere' })).toBe(noCompanyMatched);
	});

	it('asks for codes or a place, refuses a code that is not one, and says when Companies House is not configured', async () => {
		expect(await run('search_companies_house', {})).toBe('Give sicCodes, a location, or both.');
		expect(await run('search_companies_house', { sicCodes: '4391' })).toBe('4391 is not a SIC code: give five digits, such as 41202.');
		companiesHouse.isConfigured = false;
		expect(await run('search_companies_house', { location: 'Kingston' })).toContain('Companies House is not configured');
		expect(pageFound).not.toHaveBeenCalled();
	});

	it('adds a company as a lead with its number as the register writes it', async () => {
		leadAdded.mockResolvedValue({ clientId: acmeId, wasAlreadyListed: false });
		const lead = { name: 'ACME ROOFING LTD', companyNumber: '1234567', address: '1 High Street, KT1 1AA' };
		expect(await run('add_company_as_lead', lead)).toBe(`ACME ROOFING LTD is on the register as a lead — client ${acmeId}.`);
		expect(leadAdded).toHaveBeenCalledWith(staff.supabase, { ...lead, companyNumber: '01234567', postcode: '' }, 'staff-1');
	});

	it('gives back a company already on the register, and adds its officers when asked', async () => {
		leadAdded.mockResolvedValue({ clientId: acmeId, wasAlreadyListed: true });
		officersImported.mockResolvedValue({ importedCount: 2, alreadyListedCount: 0 });
		expect(await run('add_company_as_lead', { name: 'ACME ROOFING LTD', companyNumber: '12345678', withDirectors: true })).toBe(
			`ACME ROOFING LTD was already on the register — client ${acmeId}. 2 officer(s) added as people, 0 already listed.`
		);
	});

	it('needs a name and a company number that is one', async () => {
		expect(await run('add_company_as_lead', { name: '', companyNumber: '12345678' })).toBe('A company name and number are required.');
		expect(await run('add_company_as_lead', { name: 'Acme', companyNumber: 'AB12' })).toContain('is not a company number');
		expect(leadAdded).not.toHaveBeenCalled();
	});
});
