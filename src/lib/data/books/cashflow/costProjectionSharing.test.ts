import { describe, expect, it } from 'vitest';
import type { LedgerEntry } from '../ledgerEntry';
import { accounts, costCentres } from '../reports/ledgerEntries.fixtures';
import { apportionEntries } from '../sharing/apportionedEntries';
import type { CashflowItem } from './cashflowItem';
import { buildCostProjections } from './costProjection';

const vercel = { id: 'cost-centre-vercel', label: 'Vercel Pro', isArchived: false };
const carpMania = { id: costCentres.shop, label: 'Carp Mania', isArchived: false };
const ybt = { id: costCentres.office, label: 'YourBusinessToday', isArchived: false };
const Projects = { carpMania: 'project-carp-mania', ybt: 'project-ybt' };
const vercelMonthly: CashflowItem = {
	id: 'vercel',
	title: 'Vercel Pro',
	direction: 'out',
	amount: 18,
	repeats: 'monthly',
	firstMonth: '2026-12',
	lastMonth: null,
	notes: ''
};
const ybtAllAlong = { id: 'member-ybt', projectId: Projects.ybt, joinedMonth: '2026-01', leftMonth: null };
const carpManiaFromFebruary = { id: 'member-carp', projectId: Projects.carpMania, joinedMonth: '2027-02', leftMonth: null };
const share = { id: 'share-vercel', costCentreId: vercel.id, monthsCovered: 1, members: [ybtAllAlong, carpManiaFromFebruary] };
const sharing = {
	shares: [share],
	projectCostCentres: new Map([
		[Projects.ybt, ybt.id],
		[Projects.carpMania, carpMania.id]
	])
};
const months = ['2026-12', '2027-01', '2027-02', '2027-03'];

function projectionsOf(entries: LedgerEntry[], shareKept = share, items = [vercelMonthly]) {
	const shared = { ...sharing, shares: [shareKept] };
	const inputs = {
		entries: apportionEntries(entries, shared),
		asAt: '2026-11-25',
		items,
		itemCostCentres: new Map([['vercel', vercel.id]]),
		months,
		sharing: shared
	};
	return buildCostProjections(inputs, [ybt, carpMania, vercel]);
}

const monthlyCosts = (projection: { months: { costs: number }[] }) => projection.months.map((month) => month.costs);

describe('buildCostProjections with a shared cost', () => {
	it('lowers what one project will cost from the month another is planned to join, and leaves the shared cost off its own line', () => {
		const projections = projectionsOf([]);
		expect(projections.map((projection) => projection.label)).toEqual(['YourBusinessToday', 'Carp Mania']);
		const [ybtProjection, carpManiaProjection] = projections;
		expect(monthlyCosts(ybtProjection)).toEqual([18, 36, 45, 54]);
		expect(monthlyCosts(carpManiaProjection)).toEqual([0, 0, 9, 18]);
	});

	it('counts the months ahead that a line already paid covers in those months, not in what has been spent so far', () => {
		const yearlyShare = { ...share, monthsCovered: 12 };
		const paidYearly: LedgerEntry = { journalDate: '2026-11-04', ...accounts.rent, costCentreId: vercel.id, debit: 120, credit: 0 };
		const noItems: CashflowItem[] = [];
		const [ybtProjection] = projectionsOf([paidYearly], yearlyShare, noItems);
		expect(ybtProjection.soFar).toMatchObject({ costs: 10 });
		expect(monthlyCosts(ybtProjection)).toEqual([20, 30, 35, 40]);
	});
});
