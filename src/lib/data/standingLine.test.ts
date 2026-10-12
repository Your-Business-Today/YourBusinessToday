import { describe, expect, it } from 'vitest';
import { standingLine } from './standingLine';

const figures = { netAssets: 84_200, cash: 12_000, creditors: 31_499, averageEmployees: 4, madeUpTo: '2026-03-31', sourceUrl: '' };
const indicators = { statusDetail: 'active-proposal-to-strike-off', lastAccountsType: 'micro-entity', isAccountsOverdue: false, isConfirmationOverdue: true, hasInsolvency: false, hasCharges: true };

describe('standingLine', () => {
	it('reads the accounts, the figures, the flags and the notice as one sentence', () => {
		expect(standingLine({ indicators, figures, statusNote: 'Winding-up petition, noticed 14 Oct 2026' })).toBe(
			'Micro-entity accounts to 31 Mar 2026 · Net assets £84k · cash £12k · creditors £31k · 4 employees · proposal to strike off · confirmation statement overdue · charges registered · Winding-up petition, noticed 14 Oct 2026'
		);
	});

	it('says nothing when nothing is known', () => {
		expect(standingLine({ indicators: null, figures: null, statusNote: '' })).toBe('');
		expect(standingLine({ indicators: { ...indicators, lastAccountsType: '', statusDetail: '', isConfirmationOverdue: false, hasCharges: false }, figures: null, statusNote: '' })).toBe('');
	});
});
