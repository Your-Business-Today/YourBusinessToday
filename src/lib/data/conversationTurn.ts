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

export const postedViaChannels = { site: 'site', claude: 'claude' } as const;

export const awaitingKinds = { person: 'person', claude: 'claude' } as const;

export const turnStages = {
	quiet: 'quiet',
	sent: 'sent',
	withClaude: 'with_claude',
	withPerson: 'with_person'
} as const;

const postedViaOptions: PostedVia[] = Object.values(postedViaChannels);
const awaitingKindOptions: AwaitingKind[] = Object.values(awaitingKinds);
const stageOnceHeldBy: Record<AwaitingKind, TurnStage> = {
	person: turnStages.withPerson,
	claude: turnStages.withClaude
};

export function parsePostedVia(value: unknown): PostedVia {
	return postedViaOptions.find((option) => option === value) ?? siteMessage.postedVia;
}

export function parseAwaitingKind(value: unknown): AwaitingKind | null {
	return awaitingKindOptions.find((kind) => kind === value) ?? null;
}

export function parseHandOff(accountId: unknown, kind: unknown): HandOff | null {
	const awaitingKind = parseAwaitingKind(kind);
	if (typeof accountId !== 'string' || accountId === '' || awaitingKind === null) return null;
	return { accountId, kind: awaitingKind };
}

export function turnStage(turn: ConversationTurn): TurnStage {
	const awaiting = turn.awaiting;
	if (awaiting === null) return turnStages.quiet;
	if (turn.pickedUpAt === null) return turnStages.sent;
	return stageOnceHeldBy[awaiting.kind];
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
