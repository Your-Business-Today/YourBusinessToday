export type FeedEventKind =
	| 'task_raised'
	| 'task_started'
	| 'task_put_on_hold'
	| 'task_returned_to_backlog'
	| 'pull_request_opened'
	| 'task_done'
	| 'task_assigned';

export const feedEventKinds = {
	raised: 'task_raised',
	started: 'task_started',
	putOnHold: 'task_put_on_hold',
	returnedToBacklog: 'task_returned_to_backlog',
	pullRequestOpened: 'pull_request_opened',
	done: 'task_done',
	assigned: 'task_assigned'
} as const;

export const feedEventKindOrder: FeedEventKind[] = [
	feedEventKinds.raised,
	feedEventKinds.started,
	feedEventKinds.putOnHold,
	feedEventKinds.returnedToBacklog,
	feedEventKinds.pullRequestOpened,
	feedEventKinds.done,
	feedEventKinds.assigned
];

/** The short word on the event's pill, as a score page names a goal or a card. */
export const feedEventLabels: Record<FeedEventKind, string> = {
	task_raised: 'Raised',
	task_started: 'Started',
	task_put_on_hold: 'On hold',
	task_returned_to_backlog: 'Back in backlog',
	pull_request_opened: 'Pull request',
	task_done: 'Done',
	task_assigned: 'Assigned'
};

/** The verb phrase that follows who did it: "James started the task …". */
export const feedEventVerbs: Record<FeedEventKind, string> = {
	task_raised: 'raised',
	task_started: 'started',
	task_put_on_hold: 'put on hold',
	task_returned_to_backlog: 'returned to the backlog',
	pull_request_opened: 'opened a pull request for',
	task_done: 'finished',
	task_assigned: 'gave someone'
};

export function parseFeedEventKind(value: unknown): FeedEventKind | null {
	return feedEventKindOrder.find((kind) => kind === value) ?? null;
}

export function isTaskDoneEvent(kind: FeedEventKind): boolean {
	return kind === feedEventKinds.done;
}

export function isTaskAssignedEvent(kind: FeedEventKind): boolean {
	return kind === feedEventKinds.assigned;
}
