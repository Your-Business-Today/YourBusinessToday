import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { databaseStepStanding, meanwhile } from './booksLedgerCalls.fixture';
import { journalRefusal } from './booksStepJournal.fixture';
import { heldInvoice, invoiceId, journalsOfKind } from './booksInvoicePostingWorld.fixture';
import { heldLine, holdBooksWithAStatement, lineIds, loanId, match, trialBalance, unmatch } from './booksBankMatchWorld.fixture';
import { runOnTheBankLines } from './booksBankLineDatabase.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const loan = { account: { accountId: loanId, description: 'Loan from James' } };
const stepCalls = () => ledgerWrites.filter((write) => write.kind === 'rpc');

describe('what taking a match off refuses, and the races', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdBooksWithAStatement();
	});

	it('changes nothing for an organisation without Books', async () => {
		await match(lineIds.james, loan);
		standing.switchedOn = [];
		ledgerWrites.length = 0;
		expect(await unmatch(lineIds.james)).toBe(moduleNotSwitchedOn('books'));
		expect(stepCalls()).toEqual([]);
	});

	it('refuses a line never matched, and a second unmatch, by name', async () => {
		const neverMatched = 'Nothing was changed. The line of 6 Nov 2026 with BEADLE EM & GJ for £500.00 is not matched to anything, so there is no match to take off.';
		expect(await unmatch(lineIds.james)).toBe(neverMatched);
		await match(lineIds.james, loan);
		await unmatch(lineIds.james);
		expect(await unmatch(lineIds.james)).toBe(neverMatched);
		expect(journalsOfKind('manual')).toHaveLength(2);
		expect(await unmatch('not-a-line')).toContain('Nothing was changed. The bank line must be an id');
	});

	it('refuses a movement something has reversed already, so it is never reversed twice', async () => {
		await match(lineIds.james, loan);
		const [lent] = journalsOfKind('manual');
		ledgerTables.books_journals.push({ id: '00000000-0000-4000-8000-0000000f0009', journal_date: '2026-11-07', description: 'Undo the loan', kind: 'manual', reverses_journal_id: lent.id });
		const answer = await unmatch(lineIds.james);
		expect(answer).toBe('Nothing was changed. The journal "Loan from James" is reversed already, by journal 00000000-0000-4000-8000-0000000f0009; taking the match off would reverse it twice.');
		expect(heldLine(lineIds.james).matched_journal_id).toBe(lent.id);
	});

	it('refuses, changing nothing, when another unmatch takes the match off first', async () => {
		await match(lineIds.jewel, { invoicePayment: { invoiceId } });
		meanwhile(() => runOnTheBankLines('unmatch_bank_line', { bankLineId: lineIds.jewel }));
		const answer = await unmatch(lineIds.jewel);
		expect(answer).toContain('was unmatched, or what it was matched to changed, while the match was being taken off');
		expect(journalsOfKind('invoice_payment')).toHaveLength(2);
		expect(ledgerTables.books_invoice_payment_takebacks).toHaveLength(1);
	});

	it('refuses, changing nothing, when the line is matched again to something else meanwhile', async () => {
		await match(lineIds.james, loan);
		meanwhile(async () => {
			await runOnTheBankLines('unmatch_bank_line', { bankLineId: lineIds.james });
			await runOnTheBankLines('match_bank_line', { bankLineId: lineIds.james, account: { accountId: loanId, description: 'Loan from Em' } });
		});
		expect(await unmatch(lineIds.james)).toContain('while the match was being taken off');
		expect(heldLine(lineIds.james).matched_as).toBe('account');
		expect(journalsOfKind('manual')).toHaveLength(3);
	});

	it('leaves the books and the line as they were when the database refuses the reversal part way', async () => {
		await match(lineIds.jewel, { invoicePayment: { invoiceId } });
		const matched = trialBalance();
		journalRefusal.atJournal = 1;
		expect(await unmatch(lineIds.jewel)).toContain('It could not be told whether the match was taken off the line of 3 Nov 2026');
		expect(trialBalance()).toEqual(matched);
		expect(heldInvoice().status).toBe('paid');
		expect(heldLine(lineIds.jewel).matched_as).toBe('invoice_payment');
	});

	it('answers that the match came off when the step commits but its answer is lost', async () => {
		const before = trialBalance();
		await match(lineIds.james, loan);
		databaseStepStanding.isAnswerLost = true;
		expect(await unmatch(lineIds.james)).toContain('The line is unmatched and can be matched again.');
		databaseStepStanding.isAnswerLost = false;
		expect(heldLine(lineIds.james).matched_journal_id).toBeNull();
		expect(trialBalance()).toEqual(before);
	});
});
