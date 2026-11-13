import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { heldLine, holdBooksWithAStatement, lineIds, loanId, softwareId } from './booksBankMatchWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const coffeeOnTheLoan = { counterparty: 'Costa Coffee', direction: 'out', account: { accountId: loanId, description: "James's own coffee" } };
const archive = (accountId: string) => {
	const account = ledgerTables.books_ledger_accounts.find((candidate) => candidate.id === accountId) ?? {};
	account.is_archived = true;
};

describe('what a bank rule refuses, lists and takes out', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdBooksWithAStatement();
	});

	it('keeps nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await run('set_bank_rule', { ...coffeeOnTheLoan, applyNow: true })).toBe(moduleNotSwitchedOn('books'));
		expect(ledgerTables.books_bank_rules).toBeUndefined();
	});

	it('refuses a rule naming an archived account, a cost on an account that is not an expense, or no applyNow', async () => {
		const onTheLoan = await run('set_bank_rule', { counterparty: 'ADOBE', direction: 'out', cost: { expenseAccountId: loanId }, applyNow: false });
		expect(onTheLoan).toContain('a cost is coded to an expense account');
		archive(loanId);
		expect(await run('set_bank_rule', { ...coffeeOnTheLoan, applyNow: false })).toBe(
			`Nothing was saved. The account ${loanId} is archived, so nothing posts to it.`
		);
		archive(softwareId);
		const onArchivedSoftware = await run('set_bank_rule', { counterparty: 'ADOBE', direction: 'out', cost: { expenseAccountId: softwareId }, applyNow: false });
		expect(onArchivedSoftware).toBe(`Nothing was saved. The expense account ${softwareId} is archived, so nothing posts to it.`);
		expect(await run('set_bank_rule', coffeeOnTheLoan)).toBe('Nothing was saved. applyNow is true or false, always stated; undefined was given.');
		expect(ledgerTables.books_bank_rules).toBeUndefined();
	});

	it('leaves a line whose rule names an account archived since, saying why, and matches the rest', async () => {
		await run('set_bank_rule', { ...coffeeOnTheLoan, applyNow: false });
		archive(loanId);
		ledgerTables.books_bank_lines = [];
		const lines = [{ date: '2026-11-08', counterparty: 'COSTA COFFEE', amount: -3.45 }];
		const answer = await run('import_bank_lines', { applyRules: true, lines });
		expect(answer).toContain(`1 a rule covers could not be matched, and are left:\n- the line of 8 Nov 2026 with COSTA COFFEE for -£3.45: The account ${loanId} is archived`);
		expect(answer).toContain("1 left unmatched in the statement's days");
	});

	it('lists the rules with their ids, and takes one out leaving the lines it matched matched', async () => {
		expect(await run('list_bank_rules', {})).toBe("Your Business Today's books hold no bank rules yet; set_bank_rule sets one.");
		await run('set_bank_rule', { ...coffeeOnTheLoan, applyNow: true });
		const [rule] = ledgerTables.books_bank_rules;
		const listed = await run('list_bank_rules', {});
		expect(listed).toContain('Bank rules of Your Business Today, 1 in all:\n- Lines from Costa Coffee, money out, are money moving to or from 2300 Loan account: James, "James\'s own coffee". Id');
		const taken = await run('delete_bank_rule', { bankRuleId: rule.id });
		expect(taken).toContain("Took the rule out of Your Business Today's books: Lines from Costa Coffee");
		expect(ledgerTables.books_bank_rules).toEqual([]);
		expect(heldLine(lineIds.coffee).matched_as).toBe('account');
		expect(await run('delete_bank_rule', { bankRuleId: rule.id })).toContain('Nothing was deleted. No bank rule');
	});
});
