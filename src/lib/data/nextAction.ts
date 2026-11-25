import { openAskedIds, returnedAskerIds, type ThreadPost } from './threadAsks';

export type { ThreadPost } from './threadAsks';

/** Why the next move on an open task sits where it does. */
export type NextActionReason = 'ask' | 'build' | 'answered' | 'assigned' | 'raised';

export const nextActionReasons = {
	ask: 'ask',
	build: 'build',
	answered: 'answered',
	assigned: 'assigned',
	raised: 'raised'
} as const;

/** Who makes the next move on an open task; a build's next move is Claude's, so it names nobody. */
export type NextAction = { accountIds: string[]; reason: NextActionReason };

/** What the rule reads of one open task: its kind, who is on it, who raised it and its thread. */
export type NextActionFacts = {
	isDevelopment: boolean;
	assigneeIds: string[];
	raisedBy: string | null;
	posts: ThreadPost[];
};

/**
 * The one rule every list and count of open work follows. Everyone an open ask waits on moves
 * first; otherwise a build is Claude's; otherwise an answered ask goes back to whoever asked it;
 * otherwise the task is with everyone assigned to it; otherwise with whoever raised it.
 */
export function nextActionOf(facts: NextActionFacts): NextAction {
	const askedIds = openAskedIds(facts.posts);
	if (askedIds.length > 0) return { accountIds: askedIds, reason: nextActionReasons.ask };
	if (facts.isDevelopment) return { accountIds: [], reason: nextActionReasons.build };
	const askerIds = returnedAskerIds(facts.posts);
	if (askerIds.length > 0) return { accountIds: askerIds, reason: nextActionReasons.answered };
	if (facts.assigneeIds.length > 0) return { accountIds: facts.assigneeIds, reason: nextActionReasons.assigned };
	const raisedIds = facts.raisedBy === null ? [] : [facts.raisedBy];
	return { accountIds: raisedIds, reason: nextActionReasons.raised };
}

/** Whether the next move is with one of a person's logins. */
export function isNextActionWith(nextAction: NextAction, accountIds: string[]): boolean {
	return nextAction.accountIds.some((accountId) => accountIds.includes(accountId));
}
