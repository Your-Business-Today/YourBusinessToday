import { accountNameLookup } from '$lib/data/accountNames';
import { countOf } from '$lib/data/countOf';
import { projectVerdictLabels, projectVerdictMeanings } from '$lib/data/projectVerdict';
import { waitedFor, wholeDaysSince } from '$lib/data/ageInDays';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { ProjectState } from '$lib/server/projects/projectState';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

type StateReading = { projectName: string; state: ProjectState; people: Account[]; now: Date };

/** A project's state as read_project_state gives it: the verdict, then what stands behind it, bugs first. */
export function describeProjectState(reading: StateReading): string[] {
	const { projectName, state } = reading;
	const { verdict } = state;
	return [
		`# ${projectName}: ${projectVerdictLabels[verdict]}`,
		`${capitalised(projectVerdictMeanings[verdict])}.`,
		'',
		...bugSection(state.openBugs, reading.now),
		...blockingSection(reading),
		...goalSection(state),
		`This week: ${countOf(state.mergedThisWeekCount, 'task')} merged, ${countOf(state.bugsFixedThisWeekCount, 'bug')} fixed.`,
		...nextStepLines(state)
	];
}

function bugSection(openBugs: ProjectTask[], now: Date): string[] {
	if (openBugs.length === 0) return [];
	const lines = openBugs.map((bug) => `- "${bug.title}" (task id: ${bug.id}), open for ${waitedFor(wholeDaysSince(bug.createdAt, now))}`);
	return [`## Open bugs (${openBugs.length})`, ...lines, ''];
}

function blockingSection({ state, people, now }: StateReading): string[] {
	const { blocking } = state;
	if (blocking.length === 0) return [];
	const nameOf = accountNameLookup(people);
	const lines = blocking.map(({ accountId, taskIds, oldestSince }) => {
		const age = waitedFor(wholeDaysSince(oldestSince, now));
		return `- ${nameOf(accountId)}: ${countOf(taskIds.length, 'task')}, the oldest waiting ${age} (task ids: ${taskIds.join(', ')})`;
	});
	return ['## Waiting on', ...lines, ''];
}

function goalSection({ goals }: ProjectState): string[] {
	if (goals.length === 0) return [];
	const lines = goals.map(({ title, doneCount, buildingCount, waitingCount, openCount }) =>
		`- ${title}: ${doneCount} done, ${buildingCount} building, ${waitingCount} waiting, ${openCount} to start`
	);
	return ['## Current goals', ...lines, ''];
}

function nextStepLines({ nextStep }: ProjectState): string[] {
	if (nextStep === null) return [];
	const kind = nextStep.isBug ? 'the bug ' : '';
	return [`Next: ${kind}"${nextStep.title}" (task id: ${nextStep.taskId}).`];
}

function capitalised(sentence: string): string {
	return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
