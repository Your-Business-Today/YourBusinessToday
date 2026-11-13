import type { SupabaseClient } from '@supabase/supabase-js';
import { BankLineMatchKinds } from '$lib/data/books/bankLineMatchRules';
import { paymentRefusal } from '$lib/data/books/invoiceMoveRules';
import { differenceOf, formatPoundsAndPence } from '$lib/data/books/money';
import { refuseWhen } from './booksRefusal';
import type { HeldBankLine } from './heldBankLine';
import type { PreparedBankLineMatch } from './bankLineMatchSteps';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { paymentStepInputs, preparePaymentJournal } from './recordInvoicePayment';
import { expenseStepInputs, prepareExpense } from './recordExpense';

const settled = 0;
const moneyOut = -1;

/** Money in matched as a payment on an issued invoice: posted into the line's account and off trade debtors on the line's day. */
export async function prepareInvoicePaymentMatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: HeldBankLine,
	details: Record<string, unknown>
): Promise<PreparedBankLineMatch> {
	const invoice = await findHeldInvoice(supabase, organisationId, details.invoiceId);
	const payment = { paidOn: line.date, amount: line.amount };
	refuseWhen(paymentRefusal(invoice, payment.amount));
	const journal = await preparePaymentJournal(supabase, organisationId, { invoice, payment, bankAccountId: line.bankAccountId });
	return {
		stepName: 'match_books_bank_line_as_invoice_payment',
		inputs: paymentStepInputs(organisationId, invoice, payment, journal),
		journalId: journal.id,
		matchedAs: BankLineMatchKinds.invoicePayment,
		whatItWas: `a payment on invoice ${invoice.printedNumber} from ${invoice.customerName}, ${whatIsLeftOwing(invoice, line.amount)}`
	};
}

/** Money out matched as a cost paid that day: kept as a cost and posted against the line's account on the line's day. */
export async function prepareCostMatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: HeldBankLine,
	details: Record<string, unknown>
): Promise<PreparedBankLineMatch> {
	const fields = { ...details, supplier: details.supplier ?? line.counterparty, expenseDate: line.date, amount: line.amount * moneyOut, isPaid: true };
	const prepared = await prepareExpense(supabase, organisationId, fields, line.bankAccountId);
	const { recorded, journal } = prepared;
	const { supplier, description } = recorded;
	const forWhat = description === '' ? '' : ` for ${description}`;
	return {
		stepName: 'match_books_bank_line_as_cost',
		inputs: expenseStepInputs(organisationId, prepared),
		journalId: journal.id,
		matchedAs: BankLineMatchKinds.cost,
		whatItWas: `a cost from ${supplier}${forWhat}, paid that day`
	};
}

function whatIsLeftOwing(invoice: HeldInvoice, received: number): string {
	const leftOwing = differenceOf(differenceOf(invoice.total, invoice.amountPaid), received);
	if (leftOwing === settled) return 'which settles it';
	return `which leaves ${formatPoundsAndPence(leftOwing)} owing`;
}
