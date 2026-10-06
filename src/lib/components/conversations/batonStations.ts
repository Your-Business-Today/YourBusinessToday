import { claudeLabel, personLabel, type NameOf } from '$lib/data/turnLabels';
import {
	awaitingKinds,
	postedViaChannels,
	turnStage,
	type ConversationTurn,
	type TurnStage
} from '$lib/data/conversationTurn';

export type StationState = 'spoke' | 'passed' | 'holding' | 'next';

export const stationStates = {
	spoke: 'spoke',
	passed: 'passed',
	holding: 'holding',
	next: 'next'
} as const;

export type BatonStation = {
	key: string;
	label: string;
	isClaude: boolean;
	state: StationState;
	isHandOffBefore: boolean;
};

/**
 * The relay a turn describes, left to right: who spoke (and their Claude, if it
 * wrote for them), then the awaited person's Claude, then the person themselves
 * when it is theirs to answer — each marked by where the baton has got to.
 */
export function batonStations(
	turn: ConversationTurn,
	nameOf: NameOf,
	viewerId: string
): BatonStation[] {
	const awaiting = turn.awaiting;
	if (awaiting === null) return [];
	const author = turn.authorAccountId;
	const awaited = awaiting.accountId;
	const stage = turnStage(turn);
	const isWrittenByClaude = turn.postedVia === postedViaChannels.claude;
	const authorLabel = personLabel(author, nameOf, viewerId);
	const awaitedClaude = claudeLabel(awaited, nameOf, viewerId);
	const writers = isWrittenByClaude
		? [station('from-person', authorLabel, false, 'passed'), fromClaude(author, nameOf, viewerId)]
		: [station('from-person', authorLabel, false, 'spoke')];
	const toClaude = station('to-claude', awaitedClaude, true, claudeStates[stage], true);
	if (awaiting.kind === awaitingKinds.claude) return [...writers, toClaude];
	const personState = personStates[stage];
	const toPerson = station('to-person', personLabel(awaited, nameOf, viewerId), false, personState);
	return [...writers, toClaude, toPerson];
}

const claudeStates: Record<TurnStage, StationState> = {
	quiet: 'passed',
	sent: 'next',
	with_claude: 'holding',
	with_person: 'passed'
};

const personStates: Record<TurnStage, StationState> = {
	quiet: 'passed',
	sent: 'next',
	with_claude: 'next',
	with_person: 'holding'
};

function fromClaude(author: string, nameOf: NameOf, viewerId: string): BatonStation {
	return station('from-claude', claudeLabel(author, nameOf, viewerId), true, 'spoke');
}

function station(
	key: string,
	label: string,
	isClaude: boolean,
	state: StationState,
	isHandOffBefore = false
): BatonStation {
	return { key, label, isClaude, state, isHandOffBefore };
}
