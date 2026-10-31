import { describe, expect, it } from 'vitest';
import { deployHistoryOf } from './deployHistory';
import { deployPageCount, deploysOnPage, deploysPerPage, everyDeploy, filterDeploys } from './deployHistoryFilter';

const lastNight = '2026-10-31T00:00:12+00:00';
const weekAgo = '2026-10-24T23:00:09+00:00';
const tasks = [
	{ id: 'grid', title: 'Weekly cashflow grid', stagedAt: null, liveAt: lastNight },
	{ id: 'rounding', title: 'FIX: invoice total is rounded up', stagedAt: null, liveAt: lastNight },
	{ id: 'export', title: 'Export invoices to Xero', stagedAt: null, liveAt: weekAgo }
];
const deploys = deployHistoryOf(tasks);

describe('filterDeploys', () => {
	it('keeps only the tasks whose titles hold the words, dropping deploys left empty', () => {
		const found = filterDeploys(deploys, { ...everyDeploy, words: 'INVOICE' });
		expect(found.map((deploy) => deploy.tasks.map((task) => task.id))).toEqual([['rounding'], ['export']]);
	});

	it('keeps the deploys whose UK day falls between the dates, counting the dates themselves', () => {
		const lastWeek = filterDeploys(deploys, { ...everyDeploy, fromDate: '2026-10-25', toDate: '2026-10-25' });
		expect(lastWeek.map((deploy) => deploy.liveAt)).toEqual([weekAgo]);
		expect(filterDeploys(deploys, { ...everyDeploy, fromDate: '2026-10-26' })).toHaveLength(1);
	});
});

describe('deploysOnPage', () => {
	it('splits the history into pages of a fixed size, always at least one', () => {
		const many = Array.from({ length: deploysPerPage + 1 }, (_, index) => ({ liveAt: `${index}`, tasks: [] }));
		expect(deployPageCount(many)).toBe(2);
		expect(deploysOnPage(many, 2)).toHaveLength(1);
		expect(deployPageCount([])).toBe(1);
	});
});
