import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerWrites } from './booksLedgerDatabase.fixture';
import { heldBankLines, runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { holdKeyedBooks, statementLines } from './booksBankReconciliationWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const strangerId = '00000000-0000-4000-8000-0000000000ff';
const deletions = () => ledgerWrites.filter((write) => write.kind === 'delete');
const heldIds = () => heldBankLines().map((line) => String(line.id));

describe('what taking statement lines out refuses', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		holdKeyedBooks();
		await run('import_bank_lines', { applyRules: false, lines: statementLines });
	});

	it('takes nothing out for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await run('delete_bank_lines', { bankLineIds: heldIds() })).toBe(moduleNotSwitchedOn('books'));
		expect(heldBankLines()).toHaveLength(statementLines.length);
	});

	it('refuses the whole call, by the id, when one is not an id, is given twice, or is not in these books', async () => {
		const [first, second] = heldIds();
		expect(await run('delete_bank_lines', { bankLineIds: [first, 'line-2'] })).toBe(
			'Nothing was deleted. Item 2 of bankLineIds, "line-2", is not a statement line id as list_bank_lines gives it.'
		);
		expect(await run('delete_bank_lines', { bankLineIds: [first, second, first] })).toBe(
			`Nothing was deleted. Item 3 of bankLineIds, ${first}, is given twice; give each line once.`
		);
		expect(await run('delete_bank_lines', { bankLineIds: [first, strangerId] })).toBe(
			`Nothing was deleted. No bank line ${strangerId} is in this organisation's books, so none was taken out; list_bank_lines lists them.`
		);
		expect(deletions()).toEqual([]);
		expect(heldBankLines()).toHaveLength(statementLines.length);
	});

	it('refuses an empty list, a list longer than 500 and anything not a list', async () => {
		const limit = 'Nothing was deleted. bankLineIds is a list of 1 to 500 statement line ids, as list_bank_lines gives them';
		expect(await run('delete_bank_lines', { bankLineIds: [] })).toBe(`${limit}; 0 were given.`);
		expect(await run('delete_bank_lines', { bankLineIds: Array.from({ length: 501 }, () => strangerId) })).toBe(`${limit}; 501 were given.`);
		expect(await run('delete_bank_lines', { bankLineIds: heldIds()[0] })).toBe(`${limit}.`);
		expect(deletions()).toEqual([]);
	});
});
