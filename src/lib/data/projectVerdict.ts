/**
 * The one word on how a project stands, agreed with James on 5 Nov 2026. A bug always wins: an
 * existing feature that does not work comes before anything else.
 */
export type ProjectVerdict = 'bugsOpen' | 'waitingOnPeople' | 'stalled' | 'onTrack';

export const projectVerdicts = {
	bugsOpen: 'bugsOpen',
	waitingOnPeople: 'waitingOnPeople',
	stalled: 'stalled',
	onTrack: 'onTrack'
} as const;

export const projectVerdictLabels: Record<ProjectVerdict, string> = {
	bugsOpen: 'Bugs open',
	waitingOnPeople: 'Waiting on people',
	stalled: 'Stalled',
	onTrack: 'On track'
};

export const projectVerdictMeanings: Record<ProjectVerdict, string> = {
	bugsOpen: 'an existing feature is not working, and fixing it comes first',
	waitingOnPeople: 'work cannot move until someone answers, sets up or tests something',
	stalled: 'nothing has been merged, finished or said for a week, and nothing waits on anyone',
	onTrack: 'work is being built and merged, and nothing is held up by anyone'
};

/** How long a project may go without anything merged, finished or said before it counts as stalled. */
export const stalledAfterDays = 7;

/** The window the movement on a project is counted over. */
export const movementWindowDays = 7;
