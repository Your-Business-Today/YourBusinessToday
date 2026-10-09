/**
 * What a person is told before a task changes project, and what the task's own
 * conversation is told afterwards. Both sides of the move read from here, so
 * the warning and the record can never drift apart.
 */

export type TaskMoveNames = {
	sourceProjectName: string;
	destinationProjectName: string;
	hadGoal: boolean;
};

export const taskMoveWarnings = [
	'Everything on the task travels with it: its messages, acceptance criteria, checklists, ' +
		'attachments and subtasks.',
	'Its goal link is cleared, because a goal belongs to the project the task was raised on.',
	'Anyone assigned who is not on the destination project stops being an assignee.',
	'It lands at the end of the destination project’s backlog and keeps its place in the queue.',
	'It stops waiting for any task it leaves behind, and any task left behind stops waiting for it.'
];

const clearedGoalNote = ' Its goal link was cleared, because a goal belongs to one project.';

export function taskMovedSentence(names: TaskMoveNames): string {
	const moved = `Moved to ${names.destinationProjectName}, from ${names.sourceProjectName}.`;
	if (!names.hadGoal) return moved;
	return moved + clearedGoalNote;
}
