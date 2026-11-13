import type { InvoiceStatus } from './invoiceStatuses';

/** One labelled fact a document prints, such as a company number or a sort code. */
export type DocumentFact = { label: string; value: string };

/** A company the invoice names: who it is, where it is, how to reach it, and what the law asks it to state. */
export type DocumentParty = { name: string; address: string; email: string; facts: DocumentFact[] };

/** One line of the invoice as it prints. */
export type DocumentLine = { id: string; description: string; quantity: number; unitPrice: number; amount: number };

/** How the customer pays: the seller's instructions, its bank details, and what to quote. */
export type HowToPay = { instructions: string; bankFacts: DocumentFact[]; quote: string };

/** An invoice as a document a customer can file or forward: both companies, the lines, the total and how to pay. */
export type InvoiceDocument = {
	invoiceId: string;
	printedNumber: string;
	status: InvoiceStatus;
	issueDate: string;
	dueDate: string;
	reference: string;
	notes: string;
	seller: DocumentParty;
	customer: DocumentParty;
	lines: DocumentLine[];
	total: number;
	amountPaid: number;
	amountOwed: number;
	paidInFullOn: string | null;
	howToPay: HowToPay;
};
