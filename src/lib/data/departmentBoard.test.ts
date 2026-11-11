import { describe, expect, it } from 'vitest';
import { chosenBoardTab, departmentTabs, inBoardTab } from './departmentBoard';
import { boardTabs } from './boardTab';
import { boardSides } from './boardSide';
import { departments } from './department';
import { taskStatuses } from './taskStatus';
import { longTermGoalHorizon } from './goalHorizon';

const unplaced = { goalId: null, parentTaskId: null };
const backlogged = { status: taskStatuses.backlog, ...unplaced };
const insurance = {
	id: 'insurance',
	title: 'Put the insurance in place',
	department: departments.administration,
	...backlogged
};
const website = {
	id: 'website',
	title: 'As a client I want a website',
	department: departments.development,
	...backlogged
};
const doneWebsite = {
	...website,
	id: 'done-website',
	status: taskStatuses.done
};
const accounts = { ...website, id: 'accounts', goalId: 'fold-accounts' };
const ledger = { ...website, id: 'ledger', parentTaskId: 'accounts' };
const foldAccounts = { id: 'fold-accounts', horizon: longTermGoalHorizon };
const brokenLogin = {
	...website,
	id: 'login',
	title: 'FIX: sign-in fails on Safari'
};
const loginTest = {
	...website,
	id: 'login-test',
	title: 'Add a test for it',
	parentTaskId: 'login'
};

describe('the project page tabs', () => {
	const noBugs = departmentTabs([website], []);
	const withBugs = departmentTabs([website, brokenLogin], []);

	it('opens on Bugs while a bug is open, else Features, unless the address names a tab', () => {
		const page = new URL('https://ybt.test/projects/1');
		expect(chosenBoardTab(page, withBugs)).toBe(boardTabs.bugs);
		expect(chosenBoardTab(page, noBugs)).toBe(boardTabs.features);
		const salesPage = new URL('https://ybt.test/projects/1?department=sales');
		expect(chosenBoardTab(salesPage, withBugs)).toBe(boardTabs.sales);
	});

	it('opens an internal project on Internal work, even from a link to a Development tab', () => {
		const internalOnly = [boardSides.internal];
		const plainPage = new URL('https://ybt.test/projects/1');
		const bugsPage = new URL('https://ybt.test/projects/1?department=bugs');
		const salesPage = new URL('https://ybt.test/projects/1?department=sales');
		expect(chosenBoardTab(plainPage, noBugs, internalOnly)).toBe(boardTabs.administration);
		expect(chosenBoardTab(bugsPage, withBugs, internalOnly)).toBe(boardTabs.administration);
		expect(chosenBoardTab(salesPage, withBugs, internalOnly)).toBe(boardTabs.sales);
	});

	it('opens an old link to development on Features', () => {
		const oldLink = new URL('https://ybt.test/projects/1?department=development');
		expect(chosenBoardTab(oldLink, withBugs)).toBe(boardTabs.features);
	});

	it('keeps only the tab chosen, a subtask going with the task at the top of its tree', () => {
		const tasks = [insurance, website, brokenLogin, loginTest];
		expect(inBoardTab(tasks, boardTabs.administration)).toEqual([insurance]);
		expect(inBoardTab(tasks, boardTabs.bugs)).toEqual([brokenLogin, loginTest]);
		expect(inBoardTab(tasks, boardTabs.features)).toEqual([website]);
	});

	it('counts each tab’s open tasks, Bugs first', () => {
		const tabs = departmentTabs([insurance, website, doneWebsite, brokenLogin], []);
		const counts = tabs.map((tab) => [tab.tab, tab.openTaskCount]);
		expect(counts).toEqual([
			[boardTabs.bugs, 1],
			[boardTabs.features, 1],
			[boardTabs.infrastructure, 0],
			[boardTabs.administration, 1],
			[boardTabs.sales, 0],
			[boardTabs.marketing, 0]
		]);
	});

	it('leaves long term work out of a tab’s count, subtasks and all', () => {
		const tabs = departmentTabs([website, accounts, ledger], [foldAccounts]);
		const features = tabs.find((tab) => tab.tab === boardTabs.features);
		expect(features?.openTaskCount).toBe(1);
	});
});
