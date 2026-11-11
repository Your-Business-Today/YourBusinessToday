import { describe, expect, it } from 'vitest';
import { openingTabOfSide } from './boardSideTabs';
import { boardSideOfTab, boardSides, isInternalWork } from './boardSide';
import { boardTabs, type BoardTab } from './boardTab';
import { departments } from './department';
import type { DepartmentTab } from './departmentBoard';

function tabWith(tab: BoardTab, openTaskCount: number): DepartmentTab {
	return { tab, label: tab, openTaskCount };
}

const everyTab = [
	tabWith(boardTabs.bugs, 0),
	tabWith(boardTabs.features, 3),
	tabWith(boardTabs.infrastructure, 1),
	tabWith(boardTabs.administration, 2),
	tabWith(boardTabs.sales, 0),
	tabWith(boardTabs.marketing, 5)
];

describe('the two sides of a project page', () => {
	it('puts Bugs, Features and Infrastructure on Development, and the rest on Task Management', () => {
		expect(boardSideOfTab(boardTabs.infrastructure)).toBe(boardSides.development);
		expect(boardSideOfTab(boardTabs.bugs)).toBe(boardSides.development);
		expect(boardSideOfTab(boardTabs.sales)).toBe(boardSides.internal);
	});

	it('opens Development on Features and Task Management on Administration', () => {
		expect(openingTabOfSide(boardSides.development, everyTab)).toBe(boardTabs.features);
		expect(openingTabOfSide(boardSides.internal, everyTab)).toBe(boardTabs.administration);
	});

	it('opens Development on Bugs while a bug is open', () => {
		const withBug = [tabWith(boardTabs.bugs, 1), ...everyTab.slice(1)];
		expect(openingTabOfSide(boardSides.development, withBug)).toBe(boardTabs.bugs);
	});

	it('reads infrastructure as built work and administration, sales and marketing as internal', () => {
		expect(isInternalWork(departments.development)).toBe(false);
		expect(isInternalWork(departments.infrastructure)).toBe(false);
		expect(isInternalWork(departments.administration)).toBe(true);
		expect(isInternalWork(departments.sales)).toBe(true);
		expect(isInternalWork(departments.marketing)).toBe(true);
	});
});
