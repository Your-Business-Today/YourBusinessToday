import { shownIdsField, type ShownPosition } from '$lib/data/shownIds';
import type { Project } from '$lib/server/projects/projectRecord';

/** What the priority box opens on: the project, the number it starts at, and the fields it sends. */
export type PriorityChoice = {
	project: Project;
	among: string;
	priority: number;
	fields: Record<string, string>;
};

/** On a person's own board the number is the project's place among the projects shown. */
export function boardPriorityChoice(project: Project, boardPlace: ShownPosition): PriorityChoice {
	const fields = { projectId: project.id, [shownIdsField]: boardPlace.shownIds };
	return { project, among: 'of your board', priority: boardPlace.position, fields };
}

export function teamPriorityChoice(project: Project): PriorityChoice {
	const fields = { projectId: project.id };
	return { project, among: 'of your team projects', priority: project.priority, fields };
}
