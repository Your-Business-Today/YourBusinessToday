import { booksActions } from './booksActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Row = Record<string, unknown>;

const WriteKinds = { insert: 'insert', update: 'update', upsert: 'upsert', delete: 'delete' } as const;

export const organisationId = '00000000-0000-4000-8000-0000000000a1';
export const customerId = '00000000-0000-4000-8000-00000000c0a1';
export const salesId = '00000000-0000-4000-8000-000000004000';
export const bankId = '00000000-0000-4000-8000-000000001200';
export const projectsId = '00000000-0000-4000-8000-0000000cc001';
export const draftId = '00000000-0000-4000-8000-0000000d0001';
export const oldLineId = '00000000-0000-4000-8000-00000000e001';

export const websiteBuild = { description: 'Website build', quantity: 2, unitPrice: 500, incomeAccountId: salesId };

export const sixthInvoice = {
	id: draftId,
	customer_id: customerId,
	invoice_number: 6,
	status: 'draft',
	issue_date: '2026-11-01',
	due_date: '2026-12-01',
	reference: '',
	notes: ''
};

/** What each stand-in table holds for one test; an insert goes to the front, as the newest row. */
export const heldTables: Record<string, Row[]> = {};

export const invoiceWrites: { table: string; kind: string; row?: unknown }[] = [];

export function holdOneDraftInvoice(): void {
	invoiceWrites.length = 0;
	heldTables.books_settings = [{ invoice_prefix: 'INV', next_invoice_number: 4, payment_terms_days: 14 }];
	heldTables.books_customers = [{ id: customerId, name: 'Jewel Bespoke Build', contact_name: '', email: '', address: '', is_archived: false, client_id: null }];
	heldTables.books_ledger_accounts = [
		{ id: salesId, code: '4000', name: 'Sales', account_type: 'income', is_system: true, is_archived: false },
		{ id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false }
	];
	heldTables.books_cost_centres = [{ id: projectsId, name: 'Projects', is_archived: false }];
	heldTables.books_invoices = [sixthInvoice];
	heldTables.books_invoice_lines = [{ id: oldLineId, invoice_id: draftId, description: 'Old line', quantity: 1, unit_price: 10, income_account_id: salesId, cost_centre_id: null }];
	heldTables.books_invoice_payments = [];
}

/** Runs a books action as Nigel on the organisation. */
export function runInvoiceAction(name: string, input: Record<string, unknown>) {
	const caller = { accountId: 'nigel', isStaff: false, supabase: invoiceDatabase, organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }] };
	const action = booksActions.find((candidate) => candidate.name === name) as McpAction;
	return action.run(caller as unknown as McpCaller, { organisationId, ...input });
}

function keepInserted(table: string, given: Row | Row[]): Row[] {
	const rows = (Array.isArray(given) ? given : [given]).map((row, index) => ({ id: table === 'books_invoices' ? draftId : `${table}-${index}`, ...row }));
	heldTables[table] = [...rows, ...(heldTables[table] ?? [])];
	return rows;
}

/** A stand-in for the books tables: a read answers every row its table holds; a write or a step is recorded and answers. */
const invoiceDatabase = {
	rpc: async (name: string, args: Row) => {
		invoiceWrites.push({ table: name, kind: 'rpc', row: args });
		return { data: true, error: null };
	},
	from: (table: string) => {
		let answer: unknown = heldTables[table] ?? [];
		const write = (kind: string) => (row?: Row | Row[]) => {
			invoiceWrites.push({ table, kind, row });
			if (kind === WriteKinds.insert) answer = keepInserted(table, row as Row | Row[]);
			return chain;
		};
		const takeFirst = () => {
			answer = (answer as Row[])[0] ?? null;
			return chain;
		};
		const chain = {
			select: () => chain,
			eq: () => chain,
			in: (column: string, values: unknown[]) => {
				answer = (answer as Row[]).filter((row) => values.includes(row[column]));
				return chain;
			},
			lte: () => chain,
			order: () => chain,
			range: () => chain,
			limit: () => chain,
			insert: write(WriteKinds.insert),
			update: write(WriteKinds.update),
			upsert: write(WriteKinds.upsert),
			delete: write(WriteKinds.delete),
			single: takeFirst,
			maybeSingle: takeFirst,
			then: (resolve: (value: unknown) => unknown) => resolve({ data: answer, error: null })
		};
		return chain;
	}
};
