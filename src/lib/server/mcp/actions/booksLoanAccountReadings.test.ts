import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { holdThreePartnersLoans, jamesLoanId, loanOrganisationId as organisationId } from './booksLoanWorld.fixture';
import { loanDatabase } from './booksLoanSteps.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({
		id,
		parentOrganisationId: null,
		name: 'Your Business Today'
	})
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({
	getSwitchedOnModules: async () => ['books']
}));
vi.mock('$lib/data/ukClock', () => ({
	ukClockAt: () => ({ date: '2026-11-13', time: '20:00' })
}));

const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: loanDatabase,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

const run = (name: string, input: Record<string, unknown>) =>
	(booksActions.find((action) => action.name === name) as McpAction).run(nigel, { organisationId, ...input }) as Promise<string>;

const idOf = (answer: string): string => (answer.match(/\(id ([0-9a-f-]+)\)/) as RegExpMatchArray)[1];

describe('loan accounts opened over liability accounts already holding journals', () => {
	beforeEach(holdThreePartnersLoans);
	it('read back each balance from the journals already there, posting nothing', async () => {
		await run('open_loan_account', {
			personName: 'James Beadle',
			relationship: 'director',
			accountCode: '2300'
		});
		await run('open_loan_account', {
			personName: 'Nigel Reilly',
			relationship: 'director',
			accountCode: '2310'
		});
		await run('open_loan_account', {
			personName: 'Jeremy Ferendinos',
			relationship: 'shareholder',
			accountCode: '2320'
		});
		const list = await run('list_loan_accounts', {});
		expect(list).toContain('- James Beadle, director: 2300 James Beadle loan, balance -£69.25, so James Beadle owes the company £69.25');
		expect(list).toContain('- Nigel Reilly, director: 2310 Nigel loan, balance £550.00, so the company owes Nigel Reilly £550.00');
		expect(list).toContain('- Jeremy Ferendinos, shareholder: 2320 Jeremy loan, balance £550.00');
		expect(ledgerTables.books_journal_lines).toHaveLength(6);
	});

	it('read one statement with its entries, totals, overdrawn stretches and no year end yet', async () => {
		const opened = await run('open_loan_account', {
			personName: 'James Beadle',
			relationship: 'director',
			accountCode: '2300'
		});
		const statement = await run('read_loan_account', {
			loanAccountId: idOf(opened)
		});
		expect(statement).toContain('- 2026-08-20 Journal 2: out £619.25, balance -£119.25');
		expect(statement).toContain('Put in £700.00; taken out £769.25.');
		expect(statement).toContain('Balance -£69.25: James Beadle owes the company £69.25.');
		expect(statement).toContain('- from 2026-08-20 until 2026-09-02; the most owed was £119.25');
		expect(statement).toContain('- from 2026-10-05, and still overdrawn; the most owed was £69.25');
		expect(statement).toContain('No financial year has ended since the first entry.');
	});
});
