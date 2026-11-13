import { describe, expect, it } from 'vitest';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { documentStampOf, isSayingHowToPay, owingFactsOf } from './invoiceDocumentView';

const party = { name: 'Harbour Dental Care', address: '', email: '', facts: [] };
const howToPay = { instructions: '', bankFacts: [], quote: 'INV-3' };

function documentIn(status: InvoiceStatus, paidInFullOn: string | null = null): InvoiceDocument {
	const heading = { invoiceId: 'invoice-3', printedNumber: 'INV-3', issueDate: '2026-10-06', dueDate: '2026-11-05', reference: '', notes: '' };
	const money = { lines: [], total: 350, amountPaid: paidInFullOn === null ? 0 : 350, amountOwed: paidInFullOn === null ? 350 : 0 };
	return { ...heading, ...money, status, seller: party, customer: party, paidInFullOn, howToPay };
}

describe('how an invoice document reads', () => {
	it('says how to pay on every invoice but a void one, a paid one included', () => {
		expect(isSayingHowToPay(documentIn(InvoiceStatuses.paid, '2026-10-20'))).toBe(true);
		expect(isSayingHowToPay(documentIn(InvoiceStatuses.draft))).toBe(true);
		expect(isSayingHowToPay(documentIn(InvoiceStatuses.void))).toBe(false);
	});

	it('stamps a paid invoice with the day it was paid in full', () => {
		const stamp = documentStampOf(documentIn(InvoiceStatuses.paid, '2026-10-20'));
		expect(stamp?.sentence).toContain('Paid in full on');
	});

	it('leaves an issued invoice unstamped and owing its total', () => {
		const issued = documentIn(InvoiceStatuses.issued);
		expect(documentStampOf(issued)).toBeNull();
		expect(owingFactsOf(issued)).toEqual([{ label: 'To pay', value: '£350.00' }]);
	});
});
