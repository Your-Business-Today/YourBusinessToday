import { ledgerWrites } from './booksLedgerDatabase.fixture';
import { deleteCostKeepingRecord, deleteInvoiceKeepingRecord } from './booksDeletionSteps.fixture';

type Row = Record<string, unknown>;

export const nigelAccountId = '00000000-0000-4000-8000-0000000a0001';

/**
 * How the next deletion step goes: a refusal is the database refusing it, so nothing changes; a lost answer is the
 * step committing while its answer never reaches the server; the moment between runs after the server has read the row
 * and before the step locks it, as another caller could.
 */
export const deletionStepStanding: {
	refusal: { message: string } | null;
	isAnswerLost: boolean;
	momentBetween: (() => Promise<unknown>) | null;
} = { refusal: null, isAnswerLost: false, momentBetween: null };

const lostAnswer = { message: 'TypeError: fetch failed' };

const DatabaseCalls = {
	accountDirectory: 'account_directory',
	deleteInvoice: 'delete_books_invoice_keeping_record',
	deleteCost: 'delete_books_cost_keeping_record'
} as const;

const deletionSteps: Record<string, (args: Row) => string | null> = {
	[DatabaseCalls.deleteInvoice]: deleteInvoiceKeepingRecord,
	[DatabaseCalls.deleteCost]: deleteCostKeepingRecord
};

export function standDeletionStepsDown(): void {
	Object.assign(deletionStepStanding, { refusal: null, isAnswerLost: false, momentBetween: null });
}

/** A stand-in for the database functions the books call: the deletion steps, all or nothing, and the account directory. */
export async function ledgerCalls(name: string, args: Row): Promise<{ data: unknown; error: unknown }> {
	if (name === DatabaseCalls.accountDirectory) return { data: [{ id: nigelAccountId, display_name: 'Nigel', email: 'nigel@example.com' }], error: null };
	await deletionStepStanding.momentBetween?.();
	ledgerWrites.push({ table: name, kind: 'rpc', row: args });
	if (deletionStepStanding.refusal !== null) return { data: null, error: deletionStepStanding.refusal };
	const deletionId = deletionSteps[name](args);
	if (deletionStepStanding.isAnswerLost) return { data: null, error: lostAnswer };
	return { data: deletionId, error: null };
}
