import { booksActions } from './booksActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Row = Record<string, unknown>;

export const organisationId = '00000000-0000-4000-8000-0000000000a1';
export const customerId = '00000000-0000-4000-8000-00000000c0a1';
export const clientId = '00000000-0000-4000-8000-0000000c1e01';

export const jewelBespoke = {
	id: customerId,
	name: 'Jewel Bespoke Build',
	contact_name: 'Jeremy',
	email: 'accounts@jewel.example',
	address: '1 High Street',
	is_archived: false,
	client_id: null
};

/** What each stand-in table holds for one test; a write answers with the first held row of its table. */
export const heldTables: Record<string, Row[]> = {};

export const customerWrites: { table: string; row: Row }[] = [];

export function holdCustomersOnly(): void {
	customerWrites.length = 0;
	heldTables.books_customers = [jewelBespoke];
	heldTables.books_invoices = [];
	heldTables.books_invoice_lines = [];
	heldTables.books_invoice_payments = [];
	heldTables.clients = [{ id: clientId }];
}

export function isHeld(table: string): boolean {
	const rows = heldTables[table] ?? [];
	return rows.length > 0;
}

/** Runs a books action as Nigel, on the organisation, as staff or not. */
export function runCustomerAction(name: string, input: Record<string, unknown>, isStaff = false) {
	const caller = { accountId: 'nigel', isStaff, supabase: customerDatabase, organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }] };
	const action = booksActions.find((candidate) => candidate.name === name) as McpAction;
	return action.run(caller as unknown as McpCaller, { organisationId, ...input });
}

/** A stand-in for the books customer tables: answers each query with every row its table holds. */
const customerDatabase = {
	from: (table: string) => {
		const held = heldTables[table] ?? [];
		let answer: { data: unknown } = { data: held };
		const recordWrite = (row: Row) => {
			customerWrites.push({ table, row });
			return chain;
		};
		const takeOne = () => {
			answer = { data: held[0] ?? null };
			return chain;
		};
		const chain = {
			select: () => chain,
			eq: () => chain,
			order: () => chain,
			range: () => chain,
			insert: recordWrite,
			update: recordWrite,
			single: takeOne,
			maybeSingle: takeOne,
			then: (resolve: (value: unknown) => unknown) => resolve({ ...answer, error: null })
		};
		return chain;
	}
};
