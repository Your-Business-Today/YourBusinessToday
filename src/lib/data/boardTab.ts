import { departmentLabels, departments, isDevelopment, parseDepartment, type Department } from './department';
import {
	developmentKindOfTask,
	developmentKindOfTitle,
	developmentKinds,
	type DevelopmentKind
} from './developmentKind';

/**
 * The tabs of a project page. Development shows as two tabs, Bugs first, because a bug is a
 * feature already built that is not working and comes before anything new; every other
 * department is a tab of its own.
 */
export type BoardTab = 'bugs' | 'features' | Exclude<Department, 'development'>;

export const boardTabs = {
	bugs: 'bugs',
	features: 'features',
	infrastructure: departments.infrastructure,
	administration: departments.administration,
	sales: departments.sales,
	marketing: departments.marketing
} as const;

export const boardTabOrder: BoardTab[] = [
	boardTabs.bugs,
	boardTabs.features,
	boardTabs.infrastructure,
	boardTabs.administration,
	boardTabs.sales,
	boardTabs.marketing
];

export const boardTabLabels: Record<BoardTab, string> = {
	bugs: 'Bugs',
	features: 'Features',
	infrastructure: departmentLabels.infrastructure,
	administration: departmentLabels.administration,
	sales: departmentLabels.sales,
	marketing: departmentLabels.marketing
};

/** The tab named, or null when the value names none. An old link to development opens Features. */
export function parseBoardTab(value: unknown): BoardTab | null {
	const named = String(value ?? '')
		.trim()
		.toLowerCase();
	if (named === boardTabs.bugs) return boardTabs.bugs;
	if (named === boardTabs.features) return boardTabs.features;
	const department = parseDepartment(named);
	if (department === null) return null;
	return boardTabOfDepartment(department, developmentKinds.feature);
}

export function boardTabOfDepartment(department: Department, kind: DevelopmentKind): BoardTab {
	if (!isDevelopment(department)) return department as BoardTab;
	return kind === developmentKinds.bug ? boardTabs.bugs : boardTabs.features;
}

/** The department a tab's new tasks and goals go in. */
export function departmentOfBoardTab(tab: BoardTab): Department {
	if (tab === boardTabs.bugs || tab === boardTabs.features) return departments.development;
	return tab;
}

/** The kind of development task a tab raises, or null for a tab that is not development. */
export function developmentKindOfBoardTab(tab: BoardTab): DevelopmentKind | null {
	if (tab === boardTabs.bugs) return developmentKinds.bug;
	if (tab === boardTabs.features) return developmentKinds.feature;
	return null;
}

type TabbedTask = {
	id: string;
	parentTaskId: string | null;
	title: string;
	department: Department;
};

/** The tab a task sits on: a subtask sits with the task at the top of its tree. */
export function boardTabOfTask(task: TabbedTask, tasksById: Map<string, TabbedTask>): BoardTab {
	return boardTabOfDepartment(task.department, developmentKindOfTask(task, tasksById));
}

/** The tab a task named from another one sits on, read from its own title when its tree is not to hand. */
export function boardTabOfReference(reference: { department: Department; title: string }): BoardTab {
	return boardTabOfDepartment(reference.department, developmentKindOfTitle(reference.title));
}
