import { describe, expect, it } from 'vitest';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { apportionEntries, type CostSharing } from './apportionedEntries';
import type { CostShare } from './costShare';
import { directorsLoanJournalOf } from './directorsLoanJournal';
import { directorsLoanPartsOf } from './directorsLoanParts';

const CostCentres = { vercel: 'cost-centre-vercel', ybt: 'cost-centre-ybt', personal: 'cost-centre-personal' };
const loanAccount = 'account-2300';
const hosting = { accountId: 'account-6010', accountCode: '6010', accountName: 'Hosting', accountType: LedgerAccountTypes.expense };
const bank = { accountId: 'account-1200', accountCode: '1200', accountName: 'Bank', accountType: LedgerAccountTypes.asset };
const julyBill: LedgerEntry = { journalDate: '2026-07-04', ...hosting, costCentreId: CostCentres.vercel, debit: 21.95, credit: 0 };
const julyBank: LedgerEntry = { journalDate: '2026-07-04', ...bank, costCentreId: null, debit: 0, credit: 21.95 };

const ybt = { id: 'member-ybt', projectId: 'project-ybt', joinedMonth: '2026-07', leftMonth: null, weight: 3 };
const personal = {
	id: 'member-personal',
	projectId: null,
	joinedMonth: '2026-07',
	leftMonth: null,
	weight: 1,
	costCentreId: CostCentres.personal,
	directorsLoanAccountId: loanAccount
};
const share: CostShare = { id: 'share-vercel', costCentreId: CostCentres.vercel, monthsCovered: 1, membersBy: 'named', members: [ybt, personal] };
const sharing: CostSharing = { shares: [share], projectCostCentres: new Map([['project-ybt', CostCentres.ybt]]) };

describe("a shared cost's part kept on a director's loan", () => {
	it('is what the member took of the cost that month, account by account', () => {
		const [part] = directorsLoanPartsOf(apportionEntries([julyBill, julyBank], sharing), share, '2026-07');
		expect(part.member.id).toBe(personal.id);
		expect(part.pence).toBe(549);
		expect(part.lines).toEqual([{ accountId: hosting.accountId, accountCode: '6010', pence: 549 }]);
	});

	it('is nothing in a month the member does not share', () => {
		const late = { ...personal, joinedMonth: '2026-08' };
		const parts = directorsLoanPartsOf(apportionEntries([julyBill], sharing), { ...share, members: [ybt, late] }, '2026-07');
		expect(parts).toEqual([]);
	});

	it('moves by a balanced journal, the loan debited, that names the shared cost and the month and not whose it is', () => {
		const [part] = directorsLoanPartsOf(apportionEntries([julyBill], sharing), share, '2026-07');
		const journal = directorsLoanJournalOf(part, 'Vercel Pro (shared)', '2026-07', '2026-07-31');
		expect(journal.description).toBe('Personal share of Vercel Pro (shared), July 2026');
		expect(journal.lines).toEqual([
			{ accountId: loanAccount, costCentreId: null, debit: 5.49, credit: 0 },
			{ accountId: hosting.accountId, costCentreId: CostCentres.personal, debit: 0, credit: 5.49 }
		]);
	});

	it('leaves the member nothing once its journal is posted, so the profit and loss and the split agree', () => {
		const [part] = directorsLoanPartsOf(apportionEntries([julyBill], sharing), share, '2026-07');
		const journal = directorsLoanJournalOf(part, 'Vercel Pro (shared)', '2026-07', '2026-07-31');
		const posted = journal.lines.map((line) => ({
			...(line.accountId === loanAccount ? { ...bank, accountId: loanAccount, accountType: LedgerAccountTypes.liability } : hosting),
			journalDate: '2026-07-31',
			...line
		}));
		const after = apportionEntries([julyBill, ...posted], sharing);
		const personalCost = after.filter((entry) => entry.costCentreId === CostCentres.personal && entry.accountType === LedgerAccountTypes.expense);
		const net = personalCost.reduce((total, entry) => total + entry.debit - entry.credit, 0);
		expect(net).toBeCloseTo(0);
		const ybtCost = after.filter((entry) => entry.costCentreId === CostCentres.ybt).reduce((total, entry) => total + entry.debit, 0);
		expect(ybtCost).toBeCloseTo(16.46);
	});
});
