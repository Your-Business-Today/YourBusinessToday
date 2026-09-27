import type { HandOff } from '$lib/data/conversationTurn';

export type HandOffContext = {
	posterId: string;
	lastAuthorId: string | null;
	raisedById: string | null;
};

/**
 * Who a message waits on when its writer does not say: whoever spoke last, or
 * failing that whoever raised the task or goal — never the writer themselves.
 * It waits on the person; their Claude brings it to them.
 */
export function defaultHandOff(context: HandOffContext): HandOff | null {
	const candidates = [context.lastAuthorId, context.raisedById];
	const accountId = candidates.find(
		(candidate) => candidate !== null && candidate !== context.posterId
	);
	if (accountId === undefined || accountId === null) return null;
	return { accountId, kind: 'person' };
}

/** The hand-off a new message on this thread would default to, for the one about to write it. */
export function suggestHandOff(
	messages: { authorAccountId: string }[],
	posterId: string,
	raisedById: string | null
): HandOff | null {
	const lastAuthorId = messages.at(-1)?.authorAccountId ?? null;
	return defaultHandOff({ posterId, lastAuthorId, raisedById });
}
