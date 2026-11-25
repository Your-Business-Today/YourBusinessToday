import { describe, expect, it } from 'vitest';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { sumMoney } from '../money';
import { apportionEntries, type ApportionedEntry, type CostSharing } from './apportionedEntries';

const CostCentres = { appleLicence: 'cost-centre-apple', carpMania: 'cost-centre-carp-mania', codMania: 'cost-centre-cod-mania' };
const Projects = { carpMania: 'project-carp-mania', codMania: 'project-cod-mania', noCostCentre: 'project-without-cost-centre' };
const software = { accountId: 'account-6100', accountCode: '6100', accountName: 'Software', accountType: LedgerAccountTypes.expense };
const bank = { accountId: 'account-1200', accountCode: '1200', accountName: 'Bank', accountType: LedgerAccountTypes.asset };
const licencePaid: LedgerEntry = { journalDate: '2026-01-15', ...software, costCentreId: CostCentres.appleLicence, debit: 79, credit: 0 };
const bankSide: LedgerEntry = { journalDate: '2026-01-15', ...bank, costCentreId: CostCentres.appleLicence, debit: 0, credit: 79 };

const carpManiaAllYear = { id: 'member-1', projectId: Projects.carpMania, joinedMonth: '2026-01', leftMonth: null };
const codManiaFromJuly = { id: 'member-2', projectId: Projects.codMania, joinedMonth: '2026-07', leftMonth: null };

function sharingOf(members: CostSharing['shares'][number]['members']): CostSharing {
	const share = { id: 'share-apple', costCentreId: CostCentres.appleLicence, monthsCovered: 12, members };
	const projectCostCentres = new Map([
		[Projects.carpMania, CostCentres.carpMania],
		[Projects.codMania, CostCentres.codMania]
	]);
	return { shares: [share], projectCostCentres };
}

function costIn(entries: ApportionedEntry[], costCentreId: string | null, month: string): number {
	const inMonth = entries.filter((entry) => entry.costCentreId === costCentreId && entry.journalDate.startsWith(month));
	return sumMoney(inMonth.map((entry) => entry.debit));
}

describe('apportionEntries', () => {
	it('gives one project the whole of each month until a second joins, then splits the months left between them', () => {
		const entries = apportionEntries([licencePaid], sharingOf([carpManiaAllYear, codManiaFromJuly]));
		expect(costIn(entries, CostCentres.carpMania, '2026-01')).toBe(6.59);
		expect(costIn(entries, CostCentres.carpMania, '2026-06')).toBe(6.58);
		expect(costIn(entries, CostCentres.codMania, '2026-06')).toBe(0);
		expect(costIn(entries, CostCentres.carpMania, '2026-07')).toBe(3.29);
		expect(costIn(entries, CostCentres.codMania, '2026-07')).toBe(3.29);
		expect(sumMoney(entries.map((entry) => entry.debit))).toBe(79);
	});

	it('dates the first month on the day the line was dated, and each month after on its first day', () => {
		const entries = apportionEntries([licencePaid], sharingOf([carpManiaAllYear]));
		expect(entries.map((entry) => entry.journalDate).slice(0, 2)).toEqual(['2026-01-15', '2026-02-01']);
		expect(entries.every((entry) => entry.sharedFromCostCentreId === CostCentres.appleLicence)).toBe(true);
	});

	it('keeps against no project a month nobody shares, such as after the last project was dropped', () => {
		const dropped = { ...carpManiaAllYear, leftMonth: '2026-09' };
		const entries = apportionEntries([licencePaid], sharingOf([dropped]));
		expect(costIn(entries, CostCentres.carpMania, '2026-09')).toBe(6.58);
		expect(costIn(entries, null, '2026-10')).toBe(6.58);
	});

	it('takes up a dropped project’s part from the month after it leaves', () => {
		const leavesInSeptember = { ...codManiaFromJuly, leftMonth: '2026-09' };
		const entries = apportionEntries([licencePaid], sharingOf([carpManiaAllYear, leavesInSeptember]));
		expect(costIn(entries, CostCentres.codMania, '2026-09')).toBe(3.29);
		expect(costIn(entries, CostCentres.carpMania, '2026-10')).toBe(6.58);
	});

	it('keeps against no project the part of a member whose project has no cost centre', () => {
		const withoutCostCentre = { ...codManiaFromJuly, projectId: Projects.noCostCentre };
		const entries = apportionEntries([licencePaid], sharingOf([carpManiaAllYear, withoutCostCentre]));
		expect(costIn(entries, null, '2026-07')).toBe(3.29);
	});

	it('leaves a line that is not income or cost, and a line of a cost nobody shares, as the books keep it', () => {
		const otherCost = { ...licencePaid, costCentreId: CostCentres.carpMania };
		const entries = apportionEntries([bankSide, otherCost], sharingOf([carpManiaAllYear]));
		expect(entries).toEqual([
			{ ...bankSide, sharedFromCostCentreId: null },
			{ ...otherCost, sharedFromCostCentreId: null }
		]);
	});
});
