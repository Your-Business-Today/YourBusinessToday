import { claudeLabel, personLabel, type NameOf } from '$lib/data/turnLabels';
import {
	turnStage,
	type AwaitingKind,
	type ConversationTurn,
	type TurnStage
} from '$lib/data/conversationTurn';

export type StationState = 'spoke' | 'passed' | 'holding' | 'next';

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
	const stage = turnStage(turn);
	const author = turn.authorAccountId;
	const awaited = awaiting.accountId;
	const didClaudeWrite = turn.postedVia === 'claude';
	const authorState = didClaudeWrite ? 'passed' : 'spoke';
	const personState = stage === 'with_person' ? 'holding' : 'next';
	const stations = [
		station('from-person', personLabel(author, nameOf, viewerId), false, authorState),
		station('from-claude', claudeLabel(author, nameOf, viewerId), true, 'spoke'),
		station('to-claude', claudeLabel(awaited, nameOf, viewerId), true, claudeState(stage), true),
		station('to-person', personLabel(awaited, nameOf, viewerId), false, personState)
	];
	return stations.filter((candidate) => isOnTheRelay(candidate, didClaudeWrite, awaiting.kind));
}

function isOnTheRelay(candidate: BatonStation, didClaudeWrite: boolean, kind: AwaitingKind): boolean {
	if (candidate.key === 'from-claude') return didClaudeWrite;
	if (candidate.key === 'to-person') return kind === 'person';
	return true;
}

function claudeState(stage: TurnStage): StationState {
	if (stage === 'sent') return 'next';
	if (stage === 'with_claude') return 'holding';
	return 'passed';
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
