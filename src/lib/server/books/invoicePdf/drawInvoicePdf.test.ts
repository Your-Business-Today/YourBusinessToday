import { describe, expect, it } from 'vitest';
import { extractText, getDocumentProxy } from 'unpdf';
import type { DocumentLine, InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { invoicePdfFilenameOf } from '$lib/data/books/invoicePdfFilename';
import { drawInvoicePdf } from './drawInvoicePdf';

const seller = {
	name: 'Your Business Today Ltd',
	address: '1 High Street\nLeeds',
	email: 'accounts@example.com',
	facts: [{ label: 'Company number', value: '16123456' }]
};
const customer = { name: 'Harbour Dental Care', address: '2 Quay Road', email: '', facts: [] };
const bankFacts = [
	{ label: 'Account name', value: 'Your Business Today Ltd' },
	{ label: 'Sort code', value: '04-00-75' },
	{ label: 'Account number', value: '12345678' }
];

function lineNumbered(number: number): DocumentLine {
	return { id: `line-${number}`, description: `Consultancy day ${number}`, quantity: 1, unitPrice: 1000, amount: 1000 };
}

function invoiceOf(lineCount: number, customerName = customer.name): InvoiceDocument {
	const lines = Array.from({ length: lineCount }, (_, index) => lineNumbered(index + 1));
	const total = lineCount * 1000;
	const heading = { invoiceId: 'invoice-3', printedNumber: 'INV-3', issueDate: '2026-11-01', dueDate: '2026-12-01', reference: 'PO 77', notes: '' };
	const howToPay = { instructions: 'By bank transfer within 30 days.', bankFacts, quote: 'INV-3' };
	const parties = { seller, customer: { ...customer, name: customerName } };
	return { ...heading, ...parties, status: InvoiceStatuses.issued, lines, total, amountPaid: 0, amountOwed: total, paidInFullOn: null, howToPay };
}

async function pagesOf(bytes: Uint8Array): Promise<string[]> {
	const pdf = await getDocumentProxy(bytes);
	const { text } = await extractText(pdf, { mergePages: false });
	return text;
}

describe('an invoice drawn as a PDF', () => {
	it('writes the number, every line, the total and the bank details as text that can be read back', async () => {
		const pages = await pagesOf(await drawInvoicePdf(invoiceOf(3)));
		const text = pages.join('\n');
		expect(pages).toHaveLength(1);
		expect(text).not.toContain('?');
		['INV-3', '1 High Street', 'Leeds', 'Consultancy day 1', 'Consultancy day 3', '£3,000.00', '04-00-75', '12345678', 'Harbour Dental Care'].forEach((fact) =>
			expect(text).toContain(fact)
		);
	});

	it('breaks a twenty-line invoice on to a second page', async () => {
		const pages = await pagesOf(await drawInvoicePdf(invoiceOf(20)));
		expect(pages.length).toBeGreaterThan(1);
	});

	it('runs a long table of lines on to the next page, repeating its heading and the column headings', async () => {
		const pages = await pagesOf(await drawInvoicePdf(invoiceOf(40)));
		expect(pages.length).toBeGreaterThan(1);
		expect(pages[1]).toContain('INV-3');
		expect(pages[1]).toContain('Description');
		expect(pages.join('\n')).toContain('Consultancy day 40');
	});

	it('is still made when a name holds letters the standard font lacks', async () => {
		const pages = await pagesOf(await drawInvoicePdf(invoiceOf(1, 'Łukasz & Søn, café №5')));
		expect(pages.join('\n')).toContain('Lukasz & Søn, café No.5');
	});

	it('is named for the invoice as it prints', () => {
		expect(invoicePdfFilenameOf(invoiceOf(1))).toBe('INV-3.pdf');
	});
});
