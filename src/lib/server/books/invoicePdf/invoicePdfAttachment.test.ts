import { describe, expect, it } from 'vitest';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { invoicePdfAttachmentOf } from './invoicePdfAttachment';

const party = { name: 'Harbour Dental Care', address: '', email: '', facts: [] };
const pdfOpening = '%PDF-';

const invoice: InvoiceDocument = {
	...{ invoiceId: 'invoice-7', printedNumber: 'INV-7', issueDate: '2026-11-01', dueDate: '2026-12-01', reference: '', notes: '' },
	...{ status: InvoiceStatuses.issued, seller: party, customer: party, paidInFullOn: null },
	...{ lines: [], total: 0, amountPaid: 0, amountOwed: 0, howToPay: { instructions: '', bankFacts: [], quote: 'INV-7' } }
};

describe('the invoice PDF an email carries', () => {
	it('is named for the invoice and holds a PDF in base64', async () => {
		const attachment = await invoicePdfAttachmentOf(invoice);
		expect(attachment.filename).toBe('INV-7.pdf');
		expect(Buffer.from(attachment.content, 'base64').toString('latin1')).toMatch(new RegExp(`^${pdfOpening}`));
	});
});
