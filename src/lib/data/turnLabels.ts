import {
	turnStage,
	type AwaitingKind,
	type ConversationTurn,
	type HandOff,
	type TurnStage
} from './conversationTurn';

const viewerWord = 'you';
const yourAtStart = /^Your\b/;

export type NameOf = (accountId: string) => string;

export type TurnReading = {
	stage: TurnStage;
	holder: string;
	headline: string;
	isOnViewer: boolean;
	isOnClaude: boolean;
};

/** The words for whoever holds a conversation's baton, from where the viewer stands. */
export function readTurn(turn: ConversationTurn, nameOf: NameOf, viewerId: string): TurnReading {
	const stage = turnStage(turn);
	const awaiting = turn.awaiting;
	if (awaiting === null) return quietReading;
	const isOnViewer = awaiting.accountId === viewerId;
	const isOnClaude = stage !== 'with_person';
	const person = isOnViewer ? viewerWord : nameOf(awaiting.accountId);
	const holder = isOnClaude
		? claudeLabel(awaiting.accountId, nameOf, viewerId)
		: personLabel(awaiting.accountId, nameOf, viewerId);
	const headline = headlineFor(stage, holder, person, awaiting.kind);
	return { stage, holder, headline, isOnViewer, isOnClaude };
}

export function handOffLabel(handOff: HandOff, nameOf: NameOf, viewerId: string): string {
	if (handOff.kind === 'claude') return claudeLabel(handOff.accountId, nameOf, viewerId);
	return personLabel(handOff.accountId, nameOf, viewerId);
}

export function personLabel(accountId: string, nameOf: NameOf, viewerId: string): string {
	if (accountId === viewerId) return 'You';
	return nameOf(accountId);
}

export function claudeLabel(accountId: string, nameOf: NameOf, viewerId: string): string {
	if (accountId === viewerId) return 'Your Claude';
	return `${nameOf(accountId)}’s Claude`;
}

const quietReading: TurnReading = {
	stage: 'quiet',
	holder: 'Nobody',
	headline: 'Nobody is waiting — nothing is needed from anyone',
	isOnViewer: false,
	isOnClaude: false
};

function headlineFor(stage: TurnStage, holder: string, person: string, kind: AwaitingKind): string {
	const forWhom = kind === 'person' ? ` for ${person}` : '';
	if (stage === 'sent') return `Waiting on ${midSentence(holder)} to pick it up${forWhom}`;
	if (stage === 'with_claude') return `${holder} has picked it up and is answering`;
	if (person === viewerWord) return 'Waiting on you — your Claude has brought it to you';
	return `Waiting on ${person} — their Claude has brought it to them`;
}

function midSentence(label: string): string {
	return label.replace(yourAtStart, 'your');
}
