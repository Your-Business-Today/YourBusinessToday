import type { BesidePlacement } from '$lib/server/ordering/rankedSet';

/** A move from one goal or parent to another, by name; null is none. */
export type NamedMove = { leftName: string | null; joinedName: string | null };

/** What place_task did, by name, for the answer. */
export type PlacementStory = {
	taskTitle: string;
	targetTitle: string;
	placement: BesidePlacement;
	parentMove: NamedMove | null;
	goalMove: NamedMove | null;
	goalKeptBesideAnother: NamedMove | null;
};

export const joinGoalHint = 'Pass shouldJoinTargetGoal true to move it there as well.';

export function describeTaskPlacement(story: PlacementStory): string {
	const position = `"${story.taskTitle}" now sits ${story.placement} "${story.targetTitle}".`;
	const changes = [
		story.parentMove && describeParentMove(story.parentMove),
		story.goalMove && describeGoalMove(story.goalMove),
		story.goalKeptBesideAnother && describeGoalKept(story.goalKeptBesideAnother)
	];
	return [position, ...changes].filter(Boolean).join('\n');
}

export function describeUnplacedTask(taskTitle: string, targetTitle: string): string {
	return (
		`"${taskTitle}" was not moved: placing it beside "${targetTitle}" would put it under ` +
		'itself or one of its own subtasks. Nothing changed.'
	);
}

function describeParentMove(move: NamedMove): string {
	const reason = 'a task is ordered among the tasks that share its parent';
	if (move.joinedName === null) {
		return `It left "${move.leftName}" and is a top level task again, because ${reason}.`;
	}
	const leftPlace = move.leftName === null ? 'the top level' : `"${move.leftName}"`;
	return `It left ${leftPlace} and is now a subtask of "${move.joinedName}", because ${reason}.`;
}

function describeGoalMove(move: NamedMove): string {
	return `Its goal changed from ${goalName(move.leftName)} to ${goalName(move.joinedName)}.`;
}

function describeGoalKept(kept: NamedMove): string {
	const ownGoal = goalName(kept.leftName);
	const targetGoal = goalName(kept.joinedName);
	return `Its goal stays ${ownGoal}; the task it sits beside is under ${targetGoal}. ${joinGoalHint}`;
}

function goalName(name: string | null): string {
	return name === null ? 'no goal' : `"${name}"`;
}
