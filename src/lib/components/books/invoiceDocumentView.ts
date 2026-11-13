import type { BadgeTone } from '$lib/components/site/badgeTones';
import { formatBritishDate } from '$lib/data/britishDate';
import type { DocumentFact, InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { formatPoundsAndPence, toPence } from '$lib/data/books/money';

/** What is written across a document that is not simply owed: a draft, a void invoice, one paid in full. */
export type DocumentStamp = { mark: string; sentence: string };

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
	draft: 'Draft',
	issued: 'Issued',
	paid: 'Paid',
	void: 'Void'
};

export const invoiceStatusTones: Record<InvoiceStatus, BadgeTone> = {
	draft: 'notStarted',
	issued: 'warning',
	paid: 'positive',
	void: 'neutral'
};

const stampOfStatus: Record<InvoiceStatus, (document: InvoiceDocument) => DocumentStamp | null> = {
	draft: () => ({ mark: 'Draft', sentence: 'Draft: not yet issued, so nothing is owed on it.' }),
	issued: () => null,
	paid: (document) => ({ mark: 'Paid', sentence: paidSentence(document.paidInFullOn) }),
	void: () => ({ mark: 'Void', sentence: 'Void: this invoice is cancelled and nothing is owed on it.' })
};

/** The stamp the invoice's status puts across it, or null for an issued invoice still owed. */
export function documentStampOf(document: InvoiceDocument): DocumentStamp | null {
	return stampOfStatus[document.status](document);
}

/** The invoice's dates and the reference it was raised under. */
export function headingFactsOf(document: InvoiceDocument): DocumentFact[] {
	const dates = [
		{ label: 'Date', value: formatBritishDate(document.issueDate) },
		{ label: 'Due', value: formatBritishDate(document.dueDate) }
	];
	const reference = document.reference === '' ? [] : [{ label: 'Reference', value: document.reference }];
	return [...dates, ...reference];
}

/** Below the total: what has been paid on an issued invoice and what is left to pay. */
export function owingFactsOf(document: InvoiceDocument): DocumentFact[] {
	const isOwed = document.status === InvoiceStatuses.issued;
	if (!isOwed) return [];
	const hasPaidSome = toPence(document.amountPaid) > 0;
	const paidSoFar = hasPaidSome ? [{ label: 'Paid so far', value: formatPoundsAndPence(document.amountPaid) }] : [];
	return [...paidSoFar, { label: 'To pay', value: formatPoundsAndPence(document.amountOwed) }];
}

/** A draft and an issued invoice say how to pay; a paid or void one has nothing left to pay. */
export function isAskingForPayment(document: InvoiceDocument): boolean {
	const asking: InvoiceStatus[] = [InvoiceStatuses.draft, InvoiceStatuses.issued];
	return asking.includes(document.status);
}

function paidSentence(paidInFullOn: string | null): string {
	if (paidInFullOn === null) return 'Paid in full. Thank you.';
	return `Paid in full on ${formatBritishDate(paidInFullOn)}. Thank you.`;
}
