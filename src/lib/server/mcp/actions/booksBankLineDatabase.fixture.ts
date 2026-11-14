import { booksActions } from './booksActions';
import { ledgerDatabase, ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { ledgerCalls, nigelAccountId } from './booksLedgerCalls.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Row = Record<string, unknown>;

export const organisationId = '00000000-0000-4000-8000-0000000000a1';

const linesTable = 'books_bank_lines';
const sameLineColumns = ['organisation_id', 'bank_account_id', 'line_date', 'counterparty', 'reference', 'amount', 'occurrence'];
let keptCount = 0;

const keptIdDigits = 6;

/** The id the stand-in gives the nth line it keeps, shaped as the database's. */
const keptLineId = (count: number) => `00000000-0000-4000-8000-0000b1${String(count).padStart(keptIdDigits, '0')}`;

/** What the books_bank_lines stand-in holds, in the order its lines were kept. */
export function heldBankLines(): Row[] {
	return ledgerTables[linesTable] ?? [];
}

function sameLineKey(row: Row): string {
	return JSON.stringify(sameLineColumns.map((column) => (column === 'amount' ? Number(row[column]) : row[column])));
}

/** Keeps each line whose key is not held yet, as insert ... on conflict do nothing does, and answers the lines it kept. */
function keepNewLines(given: Row[]): Row[] {
	ledgerWrites.push({ table: linesTable, kind: 'upsert', row: given });
	const heldKeys = new Set(heldBankLines().map(sameLineKey));
	const kept = given
		.filter((row) => !heldKeys.has(sameLineKey(row)))
		.map((row) => ({ id: keptLineId((keptCount += 1)), matched_journal_id: null, matched_as: null, ...row }));
	ledgerTables[linesTable] = [...heldBankLines(), ...kept];
	return kept;
}

/** What the stand-in does just before it deletes, such as another person matching a line while it is being taken out. */
export const beforeBankLinesDelete: { step: (() => void) | null } = { step: null };

/** Deletes the lines every filter holds for, as delete ... returning does, and answers the lines it deleted. */
function deleteLines(filters: ((row: Row) => boolean)[]): Row[] {
	beforeBankLinesDelete.step?.();
	const isDeleted = (row: Row) => filters.every((filter) => filter(row));
	const deleted = heldBankLines().filter(isDeleted);
	ledgerWrites.push({ table: linesTable, kind: 'delete', row: deleted.map((row) => row.id) });
	ledgerTables[linesTable] = heldBankLines().filter((row) => !isDeleted(row));
	return deleted;
}

/** The books_bank_lines stand-in: an upsert that ignores lines already held, a delete, and reads narrowed by day and matching. */
function bankLinesStandIn() {
	const filters: ((row: Row) => boolean)[] = [];
	let answered: Row[] | null = null;
	let isDeleting = false;
	const chain = {
		select: () => chain,
		delete: () => ((isDeleting = true), chain),
		in: (column: string, values: unknown[]) => (filters.push((row) => values.includes(row[column])), chain),
		order: () => chain,
		eq: (column: string, value: unknown) => (filters.push((row) => row[column] === value), chain),
		gte: (column: string, value: string) => (filters.push((row) => String(row[column]) >= value), chain),
		lte: (column: string, value: string) => (filters.push((row) => String(row[column]) <= value), chain),
		is: (column: string, value: unknown) => (filters.push((row) => (row[column] ?? null) === value), chain),
		not: (column: string, _operator: string, value: unknown) => (filters.push((row) => (row[column] ?? null) !== value), chain),
		upsert: (given: Row[]) => ((answered = keepNewLines(given)), chain),
		then: (resolve: (value: unknown) => unknown) => {
			const read = () => answered ?? heldBankLines().filter((row) => filters.every((filter) => filter(row)));
			const answer = isDeleting ? deleteLines : read;
			return resolve({ data: answer(filters), error: null });
		}
	};
	return chain;
}

/** The stand-in that keeps statement lines beside the other books tables, with the database's steps. */
export const bankLineSupabase = {
	from: (table: string) => (table === linesTable ? bankLinesStandIn() : ledgerDatabase.from(table)),
	rpc: ledgerCalls
};

/** Runs a books action as Nigel on the organisation, against the stand-in that keeps statement lines and accounts. */
export function runOnTheBankLines(name: string, input: Record<string, unknown>) {
	const membership = { organisationId, accountId: nigelAccountId, isManager: false };
	const caller = { accountId: nigelAccountId, isStaff: false, supabase: bankLineSupabase, organisationMemberships: [membership] };
	const action = booksActions.find((candidate) => candidate.name === name) as McpAction;
	return action.run(caller as unknown as McpCaller, { organisationId, ...input });
}
