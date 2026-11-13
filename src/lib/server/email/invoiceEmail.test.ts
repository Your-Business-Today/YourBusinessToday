import { describe, expect, it } from 'vitest';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { invoiceEmailSubject, renderInvoiceEmail } from './invoiceEmail';

const party = { name: '', address: '', email: '', facts: [] };

const invoice: InvoiceDocument = {
	invoiceId: 'invoice-7',
	printedNumber: 'INV-7',
	status: 'issued',
	issueDate: '2026-12-01',
	dueDate: '2026-12-15',
	reference: 'PO 991',
	notes: 'Thank you for your business.',
	seller: { ...party, name: 'Your Business Today Ltd', address: '1 High Street\nLeeds', facts: [{ label: 'Company number', value: '16012345' }] },
	customer: { ...party, name: 'Acme <Builders> Ltd', email: 'ap@acme.example' },
	lines: [
		{ id: 'one', description: 'Monthly fees', quantity: 1, unitPrice: 5000, amount: 5000 },
		{ id: 'two', description: 'Hosting', quantity: 2, unitPrice: 50, amount: 100 }
	],
	total: 5100,
	amountPaid: 0,
	amountOwed: 5100,
	paidInFullOn: null,
	howToPay: { instructions: 'Pay by bank transfer.', bankFacts: [{ label: 'Sort code', value: '04-00-04' }], quote: 'INV-7' }
};

describe('the invoice email', () => {
	it('is subjected with the number, the seller, what is owed and when', () => {
		expect(invoiceEmailSubject(invoice)).toBe('Invoice INV-7 from Your Business Today Ltd: £5,100.00 due 15 December 2026');
		expect(invoiceEmailSubject({ ...invoice, status: 'paid', amountOwed: 0 })).toBe('Invoice INV-7 from Your Business Today Ltd: £5,100.00, paid in full');
	});

	it('holds every line, the total, the due date, the bank details and what to quote', () => {
		const html = renderInvoiceEmail({ document: invoice, portalUrl: null });
		for (const shown of ['Monthly fees', 'Hosting', '£5,000.00', '£5,100.00', '15 December 2026', '04-00-04', 'quote <strong>INV-7', 'PO 991', '16012345'])
			expect(html).toContain(shown);
		expect(html).toContain('1 High Street<br />Leeds');
		expect(html).not.toContain('Billing on your portal');
	});

	it('escapes what the books hold and links the portal when given', () => {
		const html = renderInvoiceEmail({ document: invoice, portalUrl: 'https://portal.example/portal/billing/invoices/invoice-7' });
		expect(html).toContain('Acme &lt;Builders&gt; Ltd');
		expect(html).toContain('href="https://portal.example/portal/billing/invoices/invoice-7"');
	});

	it('says a paid invoice is paid in full and asks for nothing on a void one', () => {
		expect(renderInvoiceEmail({ document: { ...invoice, status: 'paid', paidInFullOn: '2026-12-10' }, portalUrl: null })).toContain('Paid in full on');
		expect(renderInvoiceEmail({ document: { ...invoice, status: 'void' }, portalUrl: null })).not.toContain('How to pay');
	});
});
