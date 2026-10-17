import { complexityPhrase, storyPointsForComplexity } from '$lib/data/taskComplexity';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** What the task delivers and how big it is: its user story and its complexity measures. */
export function storyLine(task: ProjectTask): string {
	if (!task.isUserStory) return 'This is not written as a user story yet.';
	return `Story: as ${task.storyRole}, I want ${task.storyWant}, so that ${task.storyBenefit}.`;
}

export function complexityLine(task: ProjectTask): string {
	if (task.complexity === null) return 'Complexity: not measured yet (record_complexity).';
	const formulaPoints = storyPointsForComplexity(task.complexity);
	return `Complexity: ${complexityPhrase(task.complexity)}, so ${formulaPoints} points by the formula.`;
}
