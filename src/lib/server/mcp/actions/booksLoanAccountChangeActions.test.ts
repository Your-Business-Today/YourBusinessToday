import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readLoanRows } from '$lib/server/books/loansPage';
import { booksActions } from './booksActions';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { holdThreePartnersLoans, jamesLoanId as jamesLedgerId, loanOrganisationId as organisationId, postToLoan } from './booksLoanWorld.fixture';
import { loanDatabase } from './booksLoanSteps.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));
vi.mock('$lib/data/ukClock', () => ({ ukClockAt: () => ({ date: '2026-11-13', time: '20:00' }) }));

const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: loanDatabase,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

const run = (name: string, input: Record<string, unknown>) =>
	(booksActions.find((action) => action.name === name) as McpAction).run(nigel, { organisationId, ...input }) as Promise<string>;

const idOf = (answer: string): string => (answer.match(/\(id ([0-9a-f-]+)\)/) as RegExpMatchArray)[1];

let jamesId = '';
let samId = '';

describe('correcting a loan account', () => {
	beforeEach(async () => {
		holdThreePartnersLoans();
		jamesId = idOf(await run('open_loan_account', { personName: 'James Beadel', relationship: 'director', accountCode: '2300' }));
		samId = idOf(await run('open_loan_account', { personName: 'Sam Smith', relationship: 'other' }));
	});

	it('changes the name and relationship, read back everywhere, posting nothing and safe to ask twice', async () => {
		const change = { loanAccountId: jamesId, personName: 'James Beadle', relationship: 'shareholder' };
		const answer = await run('update_loan_account', change);
		expect(answer).toBe(
			"Saved in Your Business Today's books; nothing was posted:\n" +
				`- James Beadle, shareholder: 2300 James Beadle loan, balance -£69.25, so James Beadle owes the company £69.25 (id ${jamesId})`
		);
		expect(await run('update_loan_account', change)).toBe(answer);
		expect(await run('list_loan_accounts', {})).toContain('- James Beadle, shareholder: 2300 James Beadle loan');
		expect(await run('read_loan_account', { loanAccountId: jamesId })).toContain('James Beadle owes the company £69.25');
		const rows = await readLoanRows(loanDatabase as unknown as SupabaseClient, organisationId, '2026-11-13');
		expect(rows.map((row) => [row.personName, row.relationship])).toContainEqual(['James Beadle', 'shareholder']);
		expect(ledgerTables.books_journal_lines).toHaveLength(6);
	});

	it("says when the chart's account still holds the old name, and leaves it as it is", async () => {
		const answer = await run('update_loan_account', { loanAccountId: samId, personName: 'Sam Smyth' });
		expect(answer).toContain('- Sam Smyth, other: 2330 Loan account: Sam Smith, balance £0.00');
		expect(answer).toContain('The chart\'s account 2330 "Loan account: Sam Smith" still holds the old name, Sam Smith; rename_ledger_account');
		expect(ledgerTables.books_ledger_accounts.map((account) => account.name)).toContain('Loan account: Sam Smith');
	});

	it('refuses to close an account with a balance, saying what is owed which way round', async () => {
		postToLoan(jamesLedgerId, '2026-11-01', { debit: 18.47 });
		expect(await run('update_loan_account', { loanAccountId: jamesId, isClosed: true })).toBe(
			'Nothing was changed. The loan account of James Beadel cannot be closed while it holds a balance: at the end of ' +
				'2026-11-13 James Beadel owes the company £87.72. It can be closed once it stands at nil.'
		);
		expect(ledgerTables.books_loan_accounts.some((loan) => loan.is_closed === true)).toBe(false);
	});

	it('closes an account at nil and opens it again', async () => {
		expect(await run('update_loan_account', { loanAccountId: samId, isClosed: true })).toContain('- Sam Smith, other, closed: 2330');
		expect(await run('list_loan_accounts', {})).toContain('- Sam Smith, other, closed: 2330');
		expect(await run('update_loan_account', { loanAccountId: samId, isClosed: false })).toContain('- Sam Smith, other: 2330');
	});

	it('refuses by name what its columns cannot hold, and an account from other books, changing nothing', async () => {
		const otherBooksLoanId = '00000000-0000-4000-8000-0000001b2300';
		ledgerTables.books_loan_accounts.push({ ...ledgerTables.books_loan_accounts[0], id: otherBooksLoanId, organisation_id: 'other books' });
		const refusals = await Promise.all([
			run('update_loan_account', { loanAccountId: jamesId, personName: 'S'.repeat(121) }),
			run('update_loan_account', { loanAccountId: jamesId, personName: 'James ' }),
			run('update_loan_account', { loanAccountId: jamesId, relationship: 'partner' }),
			run('update_loan_account', { loanAccountId: jamesId, isClosed: 'yes' }),
			run('update_loan_account', { loanAccountId: jamesId }),
			run('update_loan_account', { loanAccountId: otherBooksLoanId, personName: 'Someone' })
		]);
		expect(refusals).toEqual([
			'Nothing was changed. personName is at most 120 characters; 121 were given.',
			'Nothing was changed. personName starts or ends with a space; give it without one.',
			'Nothing was changed. relationship is one of director, shareholder, other; "partner" was given.',
			'Nothing was changed. isClosed is true or false; "yes" was given.',
			'Nothing was changed. Give at least one of personName, relationship or isClosed to change; none was given.',
			`Nothing was changed. No loan account ${otherBooksLoanId} is in this organisation's books; list_loan_accounts lists them.`
		]);
		expect(ledgerTables.books_loan_accounts.map((loan) => loan.person_name)).toEqual(['James Beadel', 'Sam Smith', 'James Beadel']);
	});
});
