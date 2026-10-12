import { describe, expect, it } from 'vitest';
import filingHistoryFixture from './fixtures/filingHistory.json';
import companyProfileFixture from './fixtures/companyProfile.json';
import { parseCompanyProfile } from './companyProfileRecord';
import { parseFilingHistory } from './filingHistoryRecord';
import { indicatorSentence } from '$lib/data/companyIndicators';

describe('parseFilingHistory', () => {
	const filings = parseFilingHistory(filingHistoryFixture);

	it('names each filing for what it is, newest first, and drops one with no transaction id', () => {
		expect(filings.map((filing) => filing.sentence)).toEqual([
			'Micro-entity accounts to 31 Mar 2026 (AA)',
			'Confirmation statement to 15 Sept 2026 (CS01)',
			'Director appointed: Jane Smith (AP01)',
			'Registered office moved to 12 Eden Street, Kingston upon Thames, KT1 1BB (AD01)',
			'Gazette notice of strike-off (GAZ1)'
		]);
		expect(filings).toHaveLength(5);
	});

	it('maps each to the feed kind it writes and keeps the made-up date of accounts', () => {
		expect(filings.map((filing) => filing.feedKind)).toEqual(['filing_made', 'filing_made', 'officer_changed', 'office_moved', 'proposal_to_strike_off']);
		expect(filings[0].madeUpTo).toBe('2026-03-31');
		expect(filings[0].kind).toBe('accounts');
	});
});

describe('parseCompanyProfile', () => {
	it('reads the indicators an approach turns on and says them in one line', () => {
		const profile = parseCompanyProfile(companyProfileFixture);
		expect(profile).toEqual({
			companyNumber: '12345678',
			name: 'KINGSTON PRINT LIMITED',
			status: 'active',
			indicators: {
				statusDetail: 'active-proposal-to-strike-off',
				lastAccountsType: 'micro-entity',
				isAccountsOverdue: false,
				isConfirmationOverdue: true,
				hasInsolvency: false,
				hasCharges: true
			}
		});
		expect(indicatorSentence(profile.indicators)).toBe('proposal to strike off · confirmation statement overdue · charges registered');
	});
});
