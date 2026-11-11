import { ledgerWrites } from './booksLedgerDatabase.fixture';
import { deleteCostKeepingRecord, deleteInvoiceKeepingRecord } from './booksDeletionSteps.fixture';
import { issueInvoiceStep, recordPaymentStep, replaceLinesStep, voidInvoiceStep } from './booksInvoiceSteps.fixture';

type Row = Record<string, unknown>;

export const nigelAccountId = '00000000-0000-4000-8000-0000000a0001';

/**
 * How the next step of the database goes: a refusal is the database refusing it, so nothing changes; a lost answer is
 * the step committing while its answer never reaches the server; the moment between runs after the server has read the
 * row and before the step locks it, as another caller could.
 */
export const databaseStepStanding: {
	refusal: { message: string } | null;
	isAnswerLost: boolean;
	momentBetween: (() => Promise<unknown>) | null;
} = { refusal: null, isAnswerLost: false, momentBetween: null };

const lostAnswer = { message: 'TypeError: fetch failed' };

const accountDirectory = 'account_directory';

const databaseSteps: Record<string, (args: Row) => unknown> = {
	delete_books_invoice_keeping_record: deleteInvoiceKeepingRecord,
	delete_books_cost_keeping_record: deleteCostKeepingRecord,
	issue_books_invoice: issueInvoiceStep,
	void_books_invoice: voidInvoiceStep,
	record_books_invoice_payment: recordPaymentStep,
	replace_books_invoice_lines: replaceLinesStep
};

export function standDatabaseStepsDown(): void {
	Object.assign(databaseStepStanding, { refusal: null, isAnswerLost: false, momentBetween: null });
}

/** A stand-in for the database functions the books call: the steps, each all or nothing, and the account directory. */
export async function ledgerCalls(name: string, args: Row): Promise<{ data: unknown; error: unknown }> {
	if (name === accountDirectory) return { data: [{ id: nigelAccountId, display_name: 'Nigel', email: 'nigel@example.com' }], error: null };
	await databaseStepStanding.momentBetween?.();
	ledgerWrites.push({ table: name, kind: 'rpc', row: args });
	if (databaseStepStanding.refusal !== null) return { data: null, error: databaseStepStanding.refusal };
	const answer = runStep(name, args);
	if (databaseStepStanding.isAnswerLost) return { data: null, error: lostAnswer };
	return answer;
}

function runStep(name: string, args: Row): { data: unknown; error: unknown } {
	try {
		return { data: databaseSteps[name](args), error: null };
	} catch (raised) {
		return { data: null, error: raised };
	}
}
