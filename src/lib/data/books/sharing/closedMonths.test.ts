import { describe, expect, it } from 'vitest';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { sumMoney } from '../money';
import { apportionEntries, type ApportionedEntry, type CostSharing } from './apportionedEntries';
import { keepClosedMonths } from './closedMonths';
import { closedPartsOf } from './closedParts';

const Centres = { apple: 'cc-apple', carp: 'cc-carp', cod: 'cc-cod' };
const software = { accountId: 'account-6100', accountCode: '6100', accountName: 'Software', accountType: LedgerAccountTypes.expense };
const licence: LedgerEntry = { journalDate: '2026-01-15', ...software, costCentreId: Centres.apple, debit: 120, credit: 0 };
const carpAllYear = { id: 'm-carp', projectId: 'carp', joinedMonth: '2026-01', leftMonth: null };
const projectCostCentres = new Map([
	['carp', Centres.carp],
	['cod', Centres.cod]
]);
const sharingOf = (members: CostSharing['shares'][number]['members']): CostSharing => ({
	shares: [{ id: 'share-apple', costCentreId: Centres.apple, monthsCovered: 12, membersBy: 'named', members }],
	projectCostCentres
});
const costIn = (entries: ApportionedEntry[], costCentreId: string, month: string) =>
	sumMoney(entries.filter((entry) => entry.costCentreId === costCentreId && entry.journalDate.startsWith(month)).map((entry) => entry.debit));

describe('keepClosedMonths', () => {
	const asClosed = sharingOf([carpAllYear]);
	const closing = { closedTo: '2026-03', parts: closedPartsOf(apportionEntries([licence], asClosed), null, '2026-03') };

	it('leaves the closed months as they were when a member joins inside them', () => {
		const codFromFebruary = { id: 'm-cod', projectId: 'cod', joinedMonth: '2026-02', leftMonth: null };
		const sharing = sharingOf([carpAllYear, codFromFebruary]);
		const entries = keepClosedMonths(apportionEntries([licence], sharing), closing, sharing, '2026-12-31');
		expect([costIn(entries, Centres.carp, '2026-02'), costIn(entries, Centres.cod, '2026-02')]).toEqual([10, 0]);
		expect([costIn(entries, Centres.carp, '2026-04'), costIn(entries, Centres.cod, '2026-04')]).toEqual([5, 5]);
		expect(sumMoney(entries.map((entry) => entry.debit))).toBe(120);
	});

	it('counts a line dated into a closed month after it closed from the first open month', () => {
		const late: LedgerEntry = { ...licence, journalDate: '2026-02-10', debit: 1.2 };
		const entries = keepClosedMonths(apportionEntries([licence, late], asClosed), closing, asClosed, '2026-12-31');
		expect(costIn(entries, Centres.carp, '2026-02')).toBe(10);
		expect(costIn(entries, Centres.carp, '2026-04')).toBe(10.3);
		expect(sumMoney(entries.map((entry) => entry.debit))).toBe(121.2);
	});

	it('changes nothing while no month is closed', () => {
		const entries = apportionEntries([licence], asClosed);
		expect(keepClosedMonths(entries, { closedTo: null, parts: [] }, asClosed, '2026-12-31')).toBe(entries);
	});
});
