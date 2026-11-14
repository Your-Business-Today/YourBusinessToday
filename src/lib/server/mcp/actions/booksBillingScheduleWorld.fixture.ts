import { booksActions } from './booksActions';
import { clearLedgerTables, ledgerDatabase, ledgerTables } from './booksLedgerDatabase.fixture';
import { nigelAccountId } from './booksLedgerCalls.fixture';
import { withWatchRuns } from '$lib/server/watch/watchRunsDatabase.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Row = Record<string, unknown>;

export const organisationId = '00000000-0000-4000-8000-0000000000a1';
export const acmeId = '00000000-0000-4000-8000-00000000c0a1';
export const archivedCustomerId = '00000000-0000-4000-8000-00000000c0a2';
export const feesId = '00000000-0000-4000-8000-000000004000';
export const projectsId = '00000000-0000-4000-8000-0000000cc001';

/** 13 November 2026 at noon, so a first invoice on 1 December 2026 is still ahead. */
export const today = new Date('2026-11-13T12:00:00Z');

/** Books holding Acme Ltd, a customer archived long ago, a fees income account and a Projects cost centre. */
export function holdBooksWithoutSchedules(): void {
	clearLedgerTables();
	ledgerTables.books_settings = [{ invoice_prefix: 'INV', next_invoice_number: 7, payment_terms_days: 30 }];
	ledgerTables.books_customers = [
		{ id: acmeId, name: 'Acme Ltd', contact_name: '', email: 'accounts@acme.example', address: '', is_archived: false, client_id: null },
		{ id: archivedCustomerId, name: 'Gone Ltd', contact_name: '', email: '', address: '', is_archived: true, client_id: null }
	];
	ledgerTables.books_ledger_accounts = [{ id: feesId, code: '4000', name: 'Fees', account_type: 'income', is_system: true, is_archived: false }];
	ledgerTables.books_cost_centres = [{ id: projectsId, name: 'Projects', is_archived: false }];
	ledgerTables.books_billing_schedules = [];
	ledgerTables.books_billing_schedule_lines = [];
}

const replaceScheduleLinesStepName = 'replace_books_billing_schedule_lines';

/** 0221's step: every line of a schedule still in the books is put in place of the ones it held, in their order. */
function replaceScheduleLinesStep(args: Row): boolean {
	const schedules = ledgerTables.books_billing_schedules ?? [];
	const isHeld = schedules.some((schedule) => schedule.id === args.target_schedule_id);
	if (!isHeld) return false;
	const kept = (ledgerTables.books_billing_schedule_lines ?? []).filter((line) => line.schedule_id !== args.target_schedule_id);
	const given = (args.new_lines as Row[]).map((line, position) => ({
		id: crypto.randomUUID(),
		organisation_id: args.target_organisation_id,
		schedule_id: args.target_schedule_id,
		...line,
		position
	}));
	ledgerTables.books_billing_schedule_lines = [...kept, ...given];
	return true;
}

/** The stand-in that keeps what is written, with 0221's step beside its tables. */
export const scheduleSupabase = {
	...withWatchRuns(ledgerDatabase),
	rpc: async (name: string, args: Row) => {
		if (name !== replaceScheduleLinesStepName) return { data: null, error: { message: `no step ${name}` } };
		return { data: replaceScheduleLinesStep(args), error: null };
	}
};

/** Runs a books action as Nigel on the organisation, against the stand-in that keeps what is written. */
export function runOnTheBooks(name: string, input: Record<string, unknown>) {
	const membership = { organisationId, accountId: nigelAccountId, isManager: false };
	const caller = { accountId: nigelAccountId, isStaff: false, supabase: scheduleSupabase, organisationMemberships: [membership] };
	const action = booksActions.find((candidate) => candidate.name === name) as McpAction;
	return action.run(caller as unknown as McpCaller, { organisationId, ...input });
}

export function heldSchedules(): Row[] {
	return ledgerTables.books_billing_schedules ?? [];
}

export function heldScheduleLines(): Row[] {
	return ledgerTables.books_billing_schedule_lines ?? [];
}
