import { describe, expect, it } from 'vitest';
import { isoDateOf, readRegisterCompany } from './registerFileRow';

const jewel = {
	CompanyName: 'JEWEL BESPOKE BUILD LTD',
	CompanyNumber: '13752749',
	'RegAddress.AddressLine1': 'Argent House',
	'RegAddress.AddressLine2': 'Hook Rise South',
	'RegAddress.PostTown': 'Surbiton',
	'RegAddress.County': '',
	'RegAddress.PostCode': 'KT6 7LD',
	CompanyStatus: 'Active',
	IncorporationDate: '18/11/2021',
	'Accounts.AccountCategory': 'MICRO ENTITY',
	'Accounts.NextDueDate': '31/08/2027',
	ConfStmtNextDueDate: '02/12/2026',
	'Mortgages.NumMortCharges': '1',
	'SICCode.SicText_1': '41202 - Construction of domestic buildings',
	'SICCode.SicText_2': 'None Supplied',
	'SICCode.SicText_3': '',
	'SICCode.SicText_4': ''
};

describe('readRegisterCompany', () => {
	it('reads the file row against the register columns', () => {
		expect(readRegisterCompany(jewel, '2026-10-01')).toEqual({
			company_number: '13752749',
			name: 'JEWEL BESPOKE BUILD LTD',
			registered_address: 'Argent House, Hook Rise South, Surbiton',
			postcode: 'KT6 7LD',
			outcode: 'KT6',
			sector: 'KT6 7',
			company_status: 'Active',
			incorporated_on: '2021-11-18',
			account_category: 'MICRO ENTITY',
			sic_codes: ['41202'],
			next_accounts_due: '2027-08-31',
			next_statement_due: '2026-12-02',
			charge_count: 1,
			seen_month: '2026-10-01',
			source_url: 'https://find-and-update.company-information.service.gov.uk/company/13752749'
		});
	});

	it('is null for a row with no company number, and reads an unknown date or count as nothing', () => {
		expect(readRegisterCompany({ ...jewel, CompanyNumber: '' }, '2026-10-01')).toBeNull();
		expect(isoDateOf('')).toBeNull();
		expect(isoDateOf('2026-10-01')).toBeNull();
		const noCharges = readRegisterCompany({ ...jewel, 'Mortgages.NumMortCharges': '' }, '2026-10-01');
		expect(noCharges?.charge_count).toBe(0);
	});
});
