import { issueInvoice } from '$lib/server/books/issueInvoice';
import { recordInvoicePayment } from '$lib/server/books/recordInvoicePayment';
import { voidInvoice } from '$lib/server/books/voidInvoice';
import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { invoiceIdField, invoicePaymentFields } from './booksInvoiceFields';
import { readInvoiceInFull } from './booksInvoiceReading';
import type { McpAction } from '../actionTypes';

const onlyWhenThePersonSaysSo =
	'Issue an invoice only when the person says to, after reading the draft back to them with read_invoice: issuing ' +
	'posts the sale to the ledger, trade debtors against the income account of each line, and the invoice can no ' +
	'longer be changed. A mistake found after issuing is put right by voiding it and drafting a new one.';

const recordOnlyMoneyThePersonReported =
	'Record money only when the person says it has arrived, with the day it arrived and the amount they gave, never ' +
	'a figure you worked out. It posts into the bank and off trade debtors; a payment that settles what the invoice ' +
	'owes marks it paid, and one that is more than it owes is refused.';

const voidOnlyWhenThePersonSaysSo =
	'Void an invoice only when the person says to. Voiding reverses rather than removes: a journal dated today puts the ' +
	'sale back on the other sides, and the invoice is kept, marked void. One with payments recorded against it is not ' +
	'voided; tell the person so.';

export const booksInvoicePostingActions: McpAction[] = [
	moduleAction('books', {
		name: 'issue_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "issue one of an organisation's draft invoices, posting the sale to its ledger",
		guidance: onlyWhenThePersonSaysSo,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, invoiceId: invoiceIdField }, ['organisationId', 'invoiceId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const invoice = await issueInvoice(caller.supabase, organisation.id, input.invoiceId);
				const owed = `${invoice.customerName} owes ${formatPoundsAndPence(invoice.total)}, due ${formatBritishDate(invoice.dueDate)}`;
				const reading = await readInvoiceInFull(caller.supabase, organisation.id, invoice.id);
				return `Issued invoice ${invoice.printedNumber} and posted its sale to ${organisation.name}'s books: ${owed}.\n${reading}`;
			})
	}),
	moduleAction('books', {
		name: 'record_invoice_payment',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "record money received against one of an organisation's issued invoices, posting it to the bank",
		guidance: recordOnlyMoneyThePersonReported,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, invoiceId: invoiceIdField, ...invoicePaymentFields }, [
			'organisationId',
			'invoiceId',
			'paidOn',
			'amount'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const payment = await recordInvoicePayment(caller.supabase, organisation.id, input);
				const received = `${formatPoundsAndPence(payment.amount)} received on ${formatBritishDate(payment.paidOn)}`;
				const reading = await readInvoiceInFull(caller.supabase, organisation.id, String(input.invoiceId));
				return `Recorded ${received} and posted it to the bank in ${organisation.name}'s books.\n${reading}`;
			})
	}),
	moduleAction('books', {
		name: 'void_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "void one of an organisation's invoices, reversing its sale in the ledger",
		guidance: voidOnlyWhenThePersonSaysSo,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, invoiceId: invoiceIdField }, ['organisationId', 'invoiceId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const voided = await voidInvoice(caller.supabase, organisation.id, input.invoiceId);
				const ledger = voided.reversalJournalId === null ? 'it had posted nothing, so nothing was reversed' : 'its sale is reversed in the ledger';
				return `Voided invoice ${voided.printedNumber} in ${organisation.name}'s books; ${ledger}.`;
			})
	})
];
