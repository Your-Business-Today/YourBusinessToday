import { departments, type Department } from './department';
import { boardTabs, type BoardTab } from './boardTab';

/**
 * The two sides of a project page. Development is the DevOps side: the software being built and
 * the systems it runs on. Internal work is the team's own jobs, run the way monday.com runs them.
 */
export type BoardSide = 'development' | 'internal';

export const boardSides = { development: 'development', internal: 'internal' } as const;

export const boardSideOrder: BoardSide[] = [boardSides.development, boardSides.internal];

export const boardSideLabels: Record<BoardSide, string> = {
	development: 'Development',
	internal: 'Task Management'
};

export const boardSideMeanings: Record<BoardSide, string> = {
	development: 'bugs, features and infrastructure: the software being built and the systems it runs on',
	internal: 'administration, sales and marketing: the jobs the team does by hand'
};

export const tabsOnBoardSide: Record<BoardSide, BoardTab[]> = {
	development: [boardTabs.bugs, boardTabs.features, boardTabs.infrastructure],
	internal: [boardTabs.administration, boardTabs.sales, boardTabs.marketing]
};

/** The departments of Internal work, in the order its board groups them. */
export const internalDepartments: Department[] = [departments.administration, departments.sales, departments.marketing];

export function boardSideOfTab(tab: BoardTab): BoardSide {
	if (tabsOnBoardSide.internal.includes(tab)) return boardSides.internal;
	return boardSides.development;
}

export function boardSideOfDepartment(department: Department): BoardSide {
	if (internalDepartments.includes(department)) return boardSides.internal;
	return boardSides.development;
}

/** Internal work is done by a person and never built, so it carries no points, model or build steps. */
export function isInternalWork(department: Department): boolean {
	return boardSideOfDepartment(department) === boardSides.internal;
}
