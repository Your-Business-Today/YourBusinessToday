import { companyDetails } from '$lib/data/organisationCompanyDetails';
import type { OrganisationDetails } from '$lib/data/organisationRules';
import type { BooksSettings } from './booksSettings';
import type { CustomerDetails } from './customerRules';
import type { DocumentFact, DocumentLine, DocumentParty, HowToPay, InvoiceDocument } from './invoiceDocument';
import { InvoiceStatuses, type InvoiceStatus } from './invoiceStatuses';
import { differenceOf } from './money';

/** The invoice as the books hold it, numbered as it prints, with its lines and the days it was paid on. */
export type DocumentInvoiceSource = {
	id: string;
	printedNumber: string;
	status: InvoiceStatus;
	issueDate: string;
	dueDate: string;
	reference: string;
	notes: string;
	lines: DocumentLine[];
	total: number;
	amountPaid: number;
	payments: { paidOn: string }[];
};

/** Everything an invoice document is drawn from: the invoice, the seller's books settings and Details, and the customer. */
export type InvoiceDocumentSources = {
	invoice: DocumentInvoiceSource;
	settings: BooksSettings | null;
	seller: OrganisationDetails;
	customer: CustomerDetails | null;
};

/** The one description of an invoice as a document, whoever opens it. */
export function invoiceDocumentOf(sources: InvoiceDocumentSources): InvoiceDocument {
	const { invoice } = sources;
	const { id, printedNumber, status, issueDate, dueDate, reference, notes, total, amountPaid } = invoice;
	return {
		invoiceId: id,
		printedNumber,
		status,
		issueDate,
		dueDate,
		reference,
		notes,
		total,
		amountPaid,
		seller: sellerOf(sources.seller, sources.settings),
		customer: customerOf(sources.customer),
		lines: invoice.lines.map(({ id: lineId, description, quantity, unitPrice, amount }) => ({ id: lineId, description, quantity, unitPrice, amount })),
		amountOwed: differenceOf(total, amountPaid),
		paidInFullOn: paidInFullOn(invoice),
		howToPay: howToPayOf(sources.settings, printedNumber)
	};
}

function sellerOf(seller: OrganisationDetails, settings: BooksSettings | null): DocumentParty {
	const tradingName = settings?.companyName ?? '';
	const name = tradingName === '' ? seller.name : tradingName;
	const facts = companyDetails.fields.map((field) => ({ label: field.label, value: seller[field.key] }));
	return { name, address: settings?.companyAddress ?? '', email: settings?.companyEmail ?? '', facts: onlyTheGiven(facts) };
}

function customerOf(customer: CustomerDetails | null): DocumentParty {
	if (customer === null) return { name: '', address: '', email: '', facts: [] };
	const contact = { label: 'For the attention of', value: customer.contactName };
	return { name: customer.name, address: customer.address, email: customer.email, facts: onlyTheGiven([contact]) };
}

function howToPayOf(settings: BooksSettings | null, printedNumber: string): HowToPay {
	const bankFacts = [
		{ label: 'Account name', value: settings?.bankAccountName ?? '' },
		{ label: 'Sort code', value: settings?.bankSortCode ?? '' },
		{ label: 'Account number', value: settings?.bankAccountNumber ?? '' }
	];
	return { instructions: settings?.paymentInstructions ?? '', bankFacts: onlyTheGiven(bankFacts), quote: printedNumber };
}

/** The day the last payment came in, once the invoice is paid in full. */
function paidInFullOn(invoice: DocumentInvoiceSource): string | null {
	const isPaid = invoice.status === InvoiceStatuses.paid;
	const lastPayment = invoice.payments.at(-1);
	if (!isPaid || lastPayment === undefined) return null;
	return lastPayment.paidOn;
}

function onlyTheGiven(facts: DocumentFact[]): DocumentFact[] {
	return facts.filter((fact) => fact.value.trim() !== '');
}
