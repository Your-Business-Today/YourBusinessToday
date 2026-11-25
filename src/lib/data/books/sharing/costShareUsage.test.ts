import { describe, expect, it } from 'vitest';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { sumMoney } from '../money';
import { apportionEntries, type ApportionedEntry } from './apportionedEntries';
import type { CostShare } from './costShare';
import { costShareSplit } from './costShareSplit';

const hosting = { accountId: 'account-6200', accountCode: '6200', accountName: 'Hosting', accountType: LedgerAccountTypes.expense };
const vercelPro = (journalDate: string): LedgerEntry => ({ journalDate, ...hosting, costCentreId: 'cc-vercel', debit: 20, credit: 0 });
const member = (projectId: string) => ({ id: `m-${projectId}`, projectId, joinedMonth: '2026-01', leftMonth: null });
const share: CostShare = {
	id: 'share-vercel',
	costCentreId: 'cc-vercel',
	monthsCovered: 1,
	membersBy: 'named',
	members: [member('ybt'), member('carp')],
	splitBy: 'usage',
	usage: new Map([['2026-11', new Map([['ybt', 30], ['carp', 10]])]])
};
const sharing = { shares: [share], projectCostCentres: new Map([['ybt', 'cc-ybt'], ['carp', 'cc-carp']]) };
const costIn = (entries: ApportionedEntry[], costCentreId: string) => sumMoney(entries.filter((entry) => entry.costCentreId === costCentreId).map((entry) => entry.debit));

describe('a shared cost split by usage', () => {
	it('splits a month with readings of 30 and 10 three quarters and one quarter', () => {
		const entries = apportionEntries([vercelPro('2026-11-04')], sharing);
		expect([costIn(entries, 'cc-ybt'), costIn(entries, 'cc-carp')]).toEqual([15, 5]);
	});

	it('splits a month without any reading equally, and says so', () => {
		const entries = apportionEntries([vercelPro('2026-10-04')], sharing);
		expect([costIn(entries, 'cc-ybt'), costIn(entries, 'cc-carp')]).toEqual([10, 10]);
		const [october, november] = costShareSplit(apportionEntries([vercelPro('2026-10-04'), vercelPro('2026-11-04')], sharing), share, ['2026-10', '2026-11']);
		expect([october.isSplitEquallyForWantOfUsage, november.isSplitEquallyForWantOfUsage]).toEqual([true, false]);
	});

	it('gives a cost centre with no project its part by its own reading, beside the projects', () => {
		const jewel = { id: 'm-jewel', projectId: null, costCentreId: 'cc-jewel', joinedMonth: '2026-01', leftMonth: null };
		const usage = new Map([['2026-11', new Map([['ybt', 30], ['carp', 10], ['cc-jewel', 40]])]]);
		const withJewel = { ...sharing, shares: [{ ...share, members: [...share.members, jewel], usage }] };
		const entries = apportionEntries([vercelPro('2026-11-04')], withJewel);
		expect([costIn(entries, 'cc-ybt'), costIn(entries, 'cc-carp'), costIn(entries, 'cc-jewel')]).toEqual([7.5, 2.5, 10]);
	});
});
