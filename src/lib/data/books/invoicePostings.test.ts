import { describe, expect, it } from 'vitest';
import { issueLines, refundLines } from './invoicePostings';

describe('a refund taken back off the sale', () => {
	it('shares the refund across the sale lines in whole pence, the last carrying what is left, and leaves the bank', () => {
		const sales = [
			{ accountId: 'a', costCentreId: null, debit: 0, credit: 1 },
			{ accountId: 'b', costCentreId: null, debit: 0, credit: 1 },
			{ accountId: 'c', costCentreId: 'p', debit: 0, credit: 1 }
		];
		expect(refundLines('bank', sales, 1)).toEqual([
			{ accountId: 'a', costCentreId: null, debit: 0.33, credit: 0 },
			{ accountId: 'b', costCentreId: null, debit: 0.33, credit: 0 },
			{ accountId: 'c', costCentreId: 'p', debit: 0.34, credit: 0 },
			{ accountId: 'bank', costCentreId: null, debit: 0, credit: 1 }
		]);
	});
});

describe('a sale with a line that takes money off', () => {
	const sales = [
		{ incomeAccountId: 'sales', costCentreId: null, amount: 2350 },
		{ incomeAccountId: 'sales', costCentreId: 'p', amount: -2000 },
		{ incomeAccountId: 'sales', costCentreId: null, amount: 0 }
	];

	it('posts the discount as a debit to its account, trade debtors owing the total, and a line of nothing posts nothing', () => {
		expect(issueLines('debtors', 350, sales)).toEqual([
			{ accountId: 'debtors', costCentreId: null, debit: 350, credit: 0 },
			{ accountId: 'sales', costCentreId: null, debit: 0, credit: 2350 },
			{ accountId: 'sales', costCentreId: 'p', debit: 2000, credit: 0 }
		]);
	});

	it('shares a refund across every line of the sale in proportion, the discount taking its share back the other way', () => {
		const saleLines = issueLines('debtors', 350, sales).slice(1);
		expect(refundLines('bank', saleLines, 350)).toEqual([
			{ accountId: 'sales', costCentreId: null, debit: 2350, credit: 0 },
			{ accountId: 'sales', costCentreId: 'p', debit: 0, credit: 2000 },
			{ accountId: 'bank', costCentreId: null, debit: 0, credit: 350 }
		]);
	});
});
