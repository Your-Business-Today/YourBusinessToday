import { beforeEach, describe, expect, it, vi } from 'vitest';
import { beforeBankLinesDelete, heldBankLines, runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { holdReconciledBooks, keyedJournalIds, statementLines } from './booksBankReconciliationWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const mistakes = [
	{ date: '2026-11-09', counterparty: 'COSTA COFFEE', reference: '', kind: 'CONTACTLESS', amount: -3.45 },
	{ date: '2026-11-10', counterparty: 'JEWEL BESPOKE BUILD', reference: 'INV-3', kind: 'FASTER PAYMENT', amount: 350 }
];

const unmatchedIds = () => heldBankLines().filter((line) => line.matched_journal_id === null).map((line) => String(line.id));

describe('taking statement lines brought in by mistake out of the books', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdReconciledBooks();
		await run('import_bank_lines', { applyRules: false, lines: [...statementLines, ...mistakes] });
	});

	it('takes the lines out, so the bank reconciles again, and the same statement brought in again puts them back', async () => {
		expect(await run('read_bank_reconciliation', { asAt: '2026-11-10' })).toContain('The bank is not reconciled to 10 Nov 2026.');
		const answer = await run('delete_bank_lines', { bankLineIds: unmatchedIds() });
		expect(answer).toBe(
			"Took 2 statement lines out of Your Business Today's books, from 9 Nov 2026 to 10 Nov 2026: £350.00 in and £3.45 out. " +
				'No entry changed, since an unmatched line posts nothing. Bringing the statement in again puts a line back.'
		);
		expect(heldBankLines()).toHaveLength(statementLines.length);
		expect(await run('list_bank_lines', { matching: 'unmatched' })).toContain('Every statement line');
		expect(await run('read_bank_reconciliation', { asAt: '2026-11-10' })).toContain('The bank is reconciled to 10 Nov 2026.');
		expect(await run('import_bank_lines', { applyRules: false, lines: [...statementLines, ...mistakes] })).toContain('2 added, 3 already there.');
	});

	it('says one line, on its day', async () => {
		const [coffeeId] = unmatchedIds();
		expect(await run('delete_bank_lines', { bankLineIds: [coffeeId] })).toContain("Took one statement line out of Your Business Today's books, on 9 Nov 2026: £0.00 in and £3.45 out.");
	});

	it('removes nothing when one line named is matched, and names it', async () => {
		const matchedId = String(heldBankLines()[0].id);
		const answer = await run('delete_bank_lines', { bankLineIds: [...unmatchedIds(), matchedId] });
		expect(answer).toBe(
			'Nothing was deleted. These lines are matched, so none was taken out: the line of 2 Nov 2026 with BEADLE EM & GJ for £1,000.00. ' +
				'Take each match off with unmatch_bank_line first, or leave it out.'
		);
		expect(heldBankLines()).toHaveLength(statementLines.length + mistakes.length);
		expect(heldBankLines()[0].matched_journal_id).toBe(keyedJournalIds.james);
	});

	it('leaves a line matched while the lines were being taken out where it is, and names it', async () => {
		const [coffeeId, jewelId] = unmatchedIds();
		beforeBankLinesDelete.step = () => (heldBankLines().find((line) => line.id === jewelId)!.matched_journal_id = 'journal-meanwhile');
		const answer = await run('delete_bank_lines', { bankLineIds: [coffeeId, jewelId] });
		beforeBankLinesDelete.step = null;
		expect(answer).toContain("Took one statement line out of Your Business Today's books, on 9 Nov 2026");
		expect(answer).toContain('Left where it is, because it was matched while the lines were being taken out: the line of 10 Nov 2026 with JEWEL BESPOKE BUILD for £350.00.');
		expect(heldBankLines().map((line) => line.id)).toContain(jewelId);
	});
});
