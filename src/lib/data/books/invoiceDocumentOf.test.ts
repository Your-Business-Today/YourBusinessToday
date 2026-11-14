import { describe, expect, it } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import type { BooksSettings } from './booksSettings';
import { invoiceDocumentOf, type DocumentInvoiceSource, type InvoiceDocumentSources } from './invoiceDocumentOf';
import { InvoiceStatuses, type InvoiceStatus } from './invoiceStatuses';

const settings: BooksSettings = {
	companyName: 'Your Business Today',
	companyAddress: '8 Eastleigh Close\nSutton',
	companyEmail: 'accounts@example.test',
	paymentInstructions: 'Pay by bank transfer within 30 days.',
	bankAccountName: 'Your Business Today Ltd',
	bankAccountNumber: '12345678',
	bankSortCode: '12-34-56',
	paymentTermsDays: 30,
	financialYearStartMonth: 10,
	invoicePrefix: 'INV',
	nextInvoiceNumber: 4
};

const seller = {
	...blankOrganisationDetails,
	name: 'Your Business Today',
	legalName: 'Your Business Today Ltd',
	companyNumber: '17329446',
	registeredIn: 'England and Wales',
	registeredOffice: '8 Eastleigh Close, Sutton, SM2 6QY'
};

const customer = { name: 'Harbour Dental Care', contactName: 'Sam Reed', email: 'sam@example.test', address: '1 Quay Street' };

function invoiceIn(status: InvoiceStatus, payments: { paidOn: string; amount: number }[] = []): DocumentInvoiceSource {
	const amountPaid = payments.reduce((paid, payment) => paid + payment.amount, 0);
	const lines = [{ id: 'line-1', description: 'Monthly subscription', quantity: 1, unitPrice: 350, amount: 350 }];
	const heading = { id: 'invoice-3', printedNumber: 'INV-3', issueDate: '2026-11-01', dueDate: '2026-12-01', reference: 'Nov', notes: '' };
	return { ...heading, status, lines, total: 350, amountPaid, payments };
}

function sourcesFor(invoice: DocumentInvoiceSource): InvoiceDocumentSources {
	return { invoice, settings, seller, customer };
}

describe('an invoice as a document', () => {
	it('names the seller with the Details that are set, and leaves out the ones that are not', () => {
		const { seller: printedSeller } = invoiceDocumentOf(sourcesFor(invoiceIn(InvoiceStatuses.issued)));
		const sellerFacts = printedSeller.facts.map((fact) => fact.label);
		expect(printedSeller.name).toBe('Your Business Today');
		expect(sellerFacts).toEqual(['Legal name', 'Company number', 'Registered in', 'Registered office']);
		expect(printedSeller.facts).toContainEqual({ label: 'Company number', value: '17329446' });
	});

	it('says how to pay an issued invoice and asks for the invoice number to be quoted', () => {
		const { howToPay, amountOwed, paidInFullOn } = invoiceDocumentOf(sourcesFor(invoiceIn(InvoiceStatuses.issued)));
		expect(howToPay.quote).toBe('INV-3');
		expect(howToPay.bankFacts).toContainEqual({ label: 'Sort code', value: '12-34-56' });
		expect(amountOwed).toBe(350);
		expect(paidInFullOn).toBeNull();
	});

	it('keeps a draft as a draft', () => {
		const { status, customer: printedCustomer } = invoiceDocumentOf(sourcesFor(invoiceIn(InvoiceStatuses.draft)));
		expect(status).toBe(InvoiceStatuses.draft);
		expect(printedCustomer.facts).toEqual([{ label: 'For the attention of', value: 'Sam Reed' }]);
	});

	it('shows a part paid invoice owing what is left', () => {
		const document = invoiceDocumentOf(sourcesFor(invoiceIn(InvoiceStatuses.issued, [{ paidOn: '2026-11-10', amount: 100 }])));
		expect(document.amountPaid).toBe(100);
		expect(document.amountOwed).toBe(250);
		expect(document.paidInFullOn).toBeNull();
	});

	it('says when a paid invoice was paid in full', () => {
		const payments = [
			{ paidOn: '2026-11-10', amount: 100 },
			{ paidOn: '2026-11-20', amount: 250 }
		];
		const document = invoiceDocumentOf(sourcesFor(invoiceIn(InvoiceStatuses.paid, payments)));
		expect(document.paidInFullOn).toBe('2026-11-20');
		expect(document.amountOwed).toBe(0);
	});

	it('keeps a void invoice void, with nothing paid in full', () => {
		const document = invoiceDocumentOf(sourcesFor(invoiceIn(InvoiceStatuses.void)));
		expect(document.status).toBe(InvoiceStatuses.void);
		expect(document.paidInFullOn).toBeNull();
	});

	it('falls back to the organisation name and prints no bank details when the books have no settings', () => {
		const { seller: printedSeller, howToPay } = invoiceDocumentOf({ ...sourcesFor(invoiceIn(InvoiceStatuses.issued)), settings: null });
		expect(printedSeller.name).toBe('Your Business Today');
		expect(howToPay.bankFacts).toEqual([]);
	});
});
