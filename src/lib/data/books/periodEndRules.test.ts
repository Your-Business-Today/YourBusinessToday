import { describe, expect, it } from 'vitest';
import { validateAccrual, validatePrepaymentRelease } from './periodEndRules';
import { monthlyReleases } from './periodEndPostings';

const softwareId = '00000000-0000-4000-8000-000000006100';
const insurance = { firstMonthKey: '2026-11', monthCount: 12, totalAmount: 1000, description: 'Insurance', expenseAccountId: softwareId };

describe('what month end accepts', () => {
	it('takes an accrual as given, with no cost centre when none is named', () => {
		const accrual = validateAccrual({ monthKey: '2026-11', amount: 450, description: 'Audit fee', expenseAccountId: softwareId });
		expect(accrual).toEqual({ monthKey: '2026-11', amount: 450, description: 'Audit fee', expenseAccountId: softwareId, costCentreId: null });
	});

	it('refuses what the columns cannot hold, naming the field and the limit', () => {
		const auditFee = { monthKey: '2026-11', amount: 450, description: 'Audit', expenseAccountId: softwareId };
		expect(validateAccrual({ ...auditFee, monthKey: 'November' })).toContain('monthKey is a month');
		expect(validateAccrual({ ...auditFee, amount: 0 })).toBe('amount is above zero; 0 was given.');
		expect(validateAccrual({ ...auditFee, amount: 4.505 })).toContain('at most 2 decimal places');
		expect(validateAccrual({ ...auditFee, description: ' ' })).toContain('description is needed');
		expect(validateAccrual({ ...auditFee, expenseAccountId: 'software' })).toContain('The expense account must be an id');
	});

	it('spreads a prepayment over 1 to 36 whole months, a penny a month at least', () => {
		expect(validatePrepaymentRelease({ ...insurance, monthCount: 0 })).toBe('monthCount is a whole number of months from 1 to 36; 0 was given.');
		expect(validatePrepaymentRelease({ ...insurance, monthCount: 37 })).toContain('from 1 to 36; 37 was given');
		expect(validatePrepaymentRelease({ ...insurance, monthCount: 2.5 })).toContain('2.5 was given');
		expect(validatePrepaymentRelease({ ...insurance, totalAmount: 0.11 })).toBe('totalAmount is at least a penny for each of the 12 months; 0.11 was given.');
	});
});

describe('a prepayment spread across its months', () => {
	it('releases equal shares, the last carrying the odd pence, adding up to what was paid', () => {
		const release = validatePrepaymentRelease({ ...insurance, totalAmount: 100, monthCount: 6 });
		const shares = monthlyReleases(release as never);
		expect(shares.map((share) => share.amount)).toEqual([16.66, 16.66, 16.66, 16.66, 16.66, 16.7]);
		expect(shares.map((share) => share.monthKey)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04']);
	});

	it('never leaves a month with nothing, however small the amount', () => {
		const release = validatePrepaymentRelease({ ...insurance, totalAmount: 0.1, monthCount: 6 });
		expect(monthlyReleases(release as never).map((share) => share.amount)).toEqual([0.01, 0.01, 0.01, 0.01, 0.01, 0.05]);
	});
});
