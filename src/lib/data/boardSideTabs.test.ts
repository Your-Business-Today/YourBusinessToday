import { describe, expect, it } from 'vitest';
import { boardSidesFor, sideTabsOf } from './boardSideTabs';
import { boardSides, isInternalWork } from './boardSide';
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
	it('puts Bugs, Features and Infrastructure on Development, and the rest on Internal work', () => {
		const developmentSide = boardSidesFor(everyTab, boardTabs.infrastructure);
		expect(developmentSide.boardSide).toBe(boardSides.development);
		expect(developmentSide.departmentTabs.map(({ tab }) => tab)).toEqual(['bugs', 'features', 'infrastructure']);
		const internalSide = boardSidesFor(everyTab, boardTabs.sales);
		expect(internalSide.boardSide).toBe(boardSides.internal);
		expect(internalSide.departmentTabs.map(({ tab }) => tab)).toEqual(['administration', 'sales', 'marketing']);
	});

	it('counts each side’s open work and opens Internal work on Administration', () => {
		const sides = sideTabsOf(everyTab);
		expect(sides.map(({ side, openTaskCount, openingTab }) => [side, openTaskCount, openingTab])).toEqual([
			[boardSides.development, 4, boardTabs.features],
			[boardSides.internal, 7, boardTabs.administration]
		]);
	});

	it('offers an internal project its Internal work side alone', () => {
		const internalProject = boardSidesFor(everyTab, boardTabs.administration, [boardSides.internal]);
		expect(internalProject.sideTabs.map(({ side }) => side)).toEqual([boardSides.internal]);
		expect(internalProject.boardSide).toBe(boardSides.internal);
	});

	it('opens Development on Bugs while a bug is open', () => {
		const withBug = [tabWith(boardTabs.bugs, 1), ...everyTab.slice(1)];
		const [development] = sideTabsOf(withBug);
		expect(development.openingTab).toBe(boardTabs.bugs);
	});

	it('reads infrastructure as built work and administration, sales and marketing as internal', () => {
		expect(isInternalWork(departments.development)).toBe(false);
		expect(isInternalWork(departments.infrastructure)).toBe(false);
		expect(isInternalWork(departments.administration)).toBe(true);
		expect(isInternalWork(departments.sales)).toBe(true);
		expect(isInternalWork(departments.marketing)).toBe(true);
	});
});
