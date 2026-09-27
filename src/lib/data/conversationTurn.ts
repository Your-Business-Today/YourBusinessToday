export type PostedVia = 'site' | 'claude';

export type AwaitingKind = 'person' | 'claude';

/** Who must answer next: a person themselves, or their Claude on their behalf. */
export type HandOff = { accountId: string; kind: AwaitingKind };

export type MessageOrigin = { postedVia: PostedVia; awaiting: HandOff | null };

/** How a hand-off travels in a form field: the account id, then person or claude. */
export const handOffSeparator = ':';

export const siteMessage: MessageOrigin = { postedVia: 'site', awaiting: null };

/** The latest message on a goal or task: who spoke, how, and who holds the baton now. */
export type ConversationTurn = {
	authorAccountId: string;
	postedVia: PostedVia;
	awaiting: HandOff | null;
	pickedUpAt: string | null;
	since: string;
};

export type TurnStage = 'quiet' | 'sent' | 'with_claude' | 'with_person';

export function parsePostedVia(value: unknown): PostedVia {
	if (value === 'claude') return 'claude';
	return 'site';
}

export function parseAwaitingKind(value: unknown): AwaitingKind | null {
	if (value === 'person' || value === 'claude') return value;
	return null;
}

export function parseHandOff(accountId: unknown, kind: unknown): HandOff | null {
	const awaitingKind = parseAwaitingKind(kind);
	if (typeof accountId !== 'string' || accountId === '' || awaitingKind === null) return null;
	return { accountId, kind: awaitingKind };
}

export function turnStage(turn: ConversationTurn): TurnStage {
	if (turn.awaiting === null) return 'quiet';
	if (turn.pickedUpAt === null) return 'sent';
	if (turn.awaiting.kind === 'claude') return 'with_claude';
	return 'with_person';
}

type TurnMessage = Pick<ConversationTurn, 'authorAccountId' | 'postedVia' | 'awaiting' | 'pickedUpAt'> & {
	createdAt: string;
};

/** A thread's turn is its latest message: who spoke, how, and who holds the baton now. */
export function latestTurn(messages: TurnMessage[]): ConversationTurn | null {
	const latestMessage = messages.at(-1);
	if (latestMessage === undefined) return null;
	return {
		authorAccountId: latestMessage.authorAccountId,
		postedVia: latestMessage.postedVia,
		awaiting: latestMessage.awaiting,
		pickedUpAt: latestMessage.pickedUpAt,
		since: latestMessage.createdAt
	};
}
