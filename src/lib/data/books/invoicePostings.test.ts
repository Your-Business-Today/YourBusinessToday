import { describe, expect, it } from 'vitest';
import { refundLines } from './invoicePostings';

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
