import { boardSides } from '$lib/data/boardSide';
import { internalProjectLabel, internalProjectMeaning, leaveRepositoryBlankForInternal } from '$lib/data/internalProject';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { backlogSideLines } from './describeBacklogSides';
import { descriptionLine } from './describeProject';
import { goalSectionLines } from './describeGoal';
import type { InternalItemFacts } from './describeInternalItems';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { Project } from '$lib/server/projects/projectRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

const internalLabel = internalProjectLabel.toLowerCase();

/** What read_project says of an internal project: its goals and its Internal work, and nothing about code, deploys or the kit. */
export function describeInternalProject(
	project: Project,
	goals: Goal[],
	backlog: TaskTreeNode[],
	facts: InternalItemFacts
): string {
	return [
		`${project.name} — ${projectStatusLabels[project.status]}, ${internalLabel} (id: ${project.id})`,
		descriptionLine(project),
		`An ${internalLabel} project: ${internalProjectMeaning}. ${leaveRepositoryBlankForInternal}`,
		'',
		...goalSectionLines(goals),
		...backlogSideLines(backlog, goals, facts, [boardSides.internal])
	].join('\n').trimEnd();
}
