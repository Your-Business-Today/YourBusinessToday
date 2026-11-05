import { bugFixTitlePrefix } from './userStoryRule';

/**
 * What a development task is: a feature, something new to build, or a bug, something already
 * built that is not working. A bug is titled "FIX: <what is wrong>", so the title says which it is,
 * and a subtask is whatever the task at the top of its tree is.
 */
export type DevelopmentKind = 'feature' | 'bug';

export const developmentKinds = { feature: 'feature', bug: 'bug' } as const;

export const developmentKindOrder: DevelopmentKind[] = [developmentKinds.bug, developmentKinds.feature];

export const developmentKindRefusal = `A development task is a ${developmentKindOrder.join(' or a ')}.`;

/** The kind named, or null when the value names none. */
const kindsByName: Record<string, DevelopmentKind> = {
	bug: developmentKinds.bug,
	bugs: developmentKinds.bug,
	feature: developmentKinds.feature,
	features: developmentKinds.feature
};

export function parseDevelopmentKind(value: unknown): DevelopmentKind | null {
	const named = String(value ?? '')
		.trim()
		.toLowerCase();
	return kindsByName[named] ?? null;
}

export function isBugTitle(title: string): boolean {
	return title.trim().toUpperCase().startsWith(bugFixTitlePrefix);
}

export function developmentKindOfTitle(title: string): DevelopmentKind {
	return isBugTitle(title) ? developmentKinds.bug : developmentKinds.feature;
}

/** The title a bug carries: "FIX: <what is wrong>", added when it is not there already. */
export function asBugTitle(title: string): string {
	const trimmedTitle = title.trim();
	if (isBugTitle(trimmedTitle)) return trimmedTitle;
	return `${bugFixTitlePrefix} ${trimmedTitle}`;
}

/** The title a task of the kind is raised with: a bug is given its prefix, a feature keeps its title. */
export function titleForDevelopmentKind(title: string, kind: DevelopmentKind | null): string {
	if (kind === developmentKinds.bug) return asBugTitle(title);
	return title.trim();
}

type TreeTask = { id: string; parentTaskId: string | null; title: string };

/** Whether a task is a bug or a feature: a subtask goes with the task at the top of its tree. */
export function developmentKindOfTask(task: TreeTask, tasksById: Map<string, TreeTask>): DevelopmentKind {
	return developmentKindOfTitle(topOfTree(task, tasksById).title);
}

function topOfTree(task: TreeTask, tasksById: Map<string, TreeTask>): TreeTask {
	const seen = new Set<string>();
	let top = task;
	while (top.parentTaskId !== null && !seen.has(top.id)) {
		seen.add(top.id);
		const parent = tasksById.get(top.parentTaskId);
		if (parent === undefined) return top;
		top = parent;
	}
	return top;
}
