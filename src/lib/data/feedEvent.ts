import { feedEventVerbs, isTaskDoneEvent, type FeedEventKind } from './feedEventKind';

/** One thing that happened to a task, as the feed shows it. */
export type FeedEvent = {
	id: string;
	kind: FeedEventKind;
	projectId: string;
	projectName: string;
	taskId: string;
	taskTitle: string;
	actorAccountId: string | null;
	actorName: string | null;
	forAccountId: string | null;
	detail: string;
	createdAt: string;
};

export const feedScopes = { everything: 'everything', mine: 'mine' } as const;

export type FeedScope = (typeof feedScopes)[keyof typeof feedScopes];

const mergedPullRequest = 'A merged pull request';
const theConnector = 'A Claude through the connector';

export function parseFeedScope(value: unknown): FeedScope {
	if (value === feedScopes.mine) return feedScopes.mine;
	return feedScopes.everything;
}

export function isFeedEventFor(event: FeedEvent, accountId: string): boolean {
	return event.forAccountId === accountId;
}

/** Who made the move, when nobody signed in did: the merge for a done task, the connector otherwise. */
export function feedActorName(event: FeedEvent): string {
	if (event.actorName !== null) return event.actorName;
	if (isTaskDoneEvent(event.kind)) return mergedPullRequest;
	return theConnector;
}

/** "James finished the task “Round the invoice total” on YourBusinessToday". */
export function feedEventSentence(event: FeedEvent): string {
	const verb = feedEventVerbs[event.kind];
	return `${feedActorName(event)} ${verb} the task “${event.taskTitle}” on ${event.projectName}`;
}
