import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { deleteCostKeepingRecord, deleteInvoiceKeepingRecord } from './booksDeletionSteps.fixture';
import { issueInvoiceStep, recordPaymentStep, replaceLinesStep, voidInvoiceStep } from './booksInvoiceSteps.fixture';
import { payCostStep, postJournalSetStep, recordLoanPaidCostStep, recordCostStep } from './booksCostSteps.fixture';
import { beginStep, journalRefusal } from './booksStepJournal.fixture';
import { matchAsCostStep, matchAsInvoicePaymentStep, matchToAccountStep, tieBankLineStep } from './booksBankMatchSteps.fixture';
import { takeBackPaymentStep, unmatchAccountStep, unmatchCostStep, unmatchInvoicePaymentStep, untieBankLineStep } from './booksBankUnmatchSteps.fixture';

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
	replace_books_invoice_lines: replaceLinesStep,
	record_books_expense: recordCostStep,
	record_books_expense_paid_by_loan_account: recordLoanPaidCostStep,
	pay_books_expense: payCostStep,
	post_books_journal_set: postJournalSetStep,
	tie_books_bank_line: tieBankLineStep,
	match_books_bank_line_as_invoice_payment: matchAsInvoicePaymentStep,
	match_books_bank_line_as_cost: matchAsCostStep,
	match_books_bank_line_to_account: matchToAccountStep,
	untie_books_bank_line: untieBankLineStep,
	take_back_books_invoice_payment: takeBackPaymentStep,
	unmatch_books_bank_line_invoice_payment: unmatchInvoicePaymentStep,
	unmatch_books_bank_line_cost: unmatchCostStep,
	unmatch_books_bank_line_account: unmatchAccountStep
};

/** Runs the work once, after the server has read the row and before the step locks it, as another caller could. */
export function meanwhile(work: () => Promise<unknown>): void {
	databaseStepStanding.momentBetween = async () => {
		databaseStepStanding.momentBetween = null;
		await work();
	};
}

export function standDatabaseStepsDown(): void {
	Object.assign(databaseStepStanding, { refusal: null, isAnswerLost: false, momentBetween: null });
	journalRefusal.atJournal = null;
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

/** A step is one transaction: when it raises, every table is put back as it stood before the step began. */
function runStep(name: string, args: Row): { data: unknown; error: unknown } {
	const before = structuredClone(ledgerTables);
	beginStep();
	try {
		return { data: databaseSteps[name](args), error: null };
	} catch (raised) {
		putBack(before);
		return { data: null, error: raised };
	}
}

function putBack(before: Record<string, Row[]>): void {
	for (const table of Object.keys(ledgerTables)) delete ledgerTables[table];
	Object.assign(ledgerTables, before);
}
