import type { TaskKind } from './taskKind';

export type UserStory = {
	role: string;
	want: string;
	benefit: string;
};

export type StoryCandidate = { kind: TaskKind; title: string; parentTaskId: string | null };

export const bugFixTitlePrefix = 'FIX:';
const refactorRoundTitlePrefix = 'REFACTOR:';
const storyExemptTitlePrefixes = [bugFixTitlePrefix, refactorRoundTitlePrefix];

export const storyRequiredRefusal =
	'Every task is a user story unless it is a bug fix: say who it is for (as a…), what they ' +
	`want (I want…) and why (so that…) — or title a bug "${bugFixTitlePrefix} <what is wrong>".`;

/**
 * A top level work task is a user story. A bug fix, a refactor round, a support
 * task (somebody waiting on an answer) and a subtask (a step of a story) are not.
 */
export function needsUserStory(task: StoryCandidate): boolean {
	if (task.kind === 'support') return false;
	if (task.parentTaskId !== null) return false;
	return !hasStoryExemptTitle(task.title);
}

export function hasStoryExemptTitle(title: string): boolean {
	const shoutedTitle = title.trim().toUpperCase();
	return storyExemptTitlePrefixes.some((prefix) => shoutedTitle.startsWith(prefix));
}

export function isStoryComplete(story: UserStory): boolean {
	return story.role !== '' && story.want !== '' && story.benefit !== '';
}

export function isStoryEmpty(story: UserStory): boolean {
	return story.role === '' && story.want === '' && story.benefit === '';
}
