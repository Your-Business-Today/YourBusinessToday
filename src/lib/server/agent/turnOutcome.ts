import type { AgendaKind } from './agendaItem';

/** What the person said to the item raised: the answer itself, a promise, work started or finished, a test, a tick, or not now. */
export type TurnOutcome = 'answered' | 'promised' | 'started' | 'finished' | 'confirmed' | 'failed' | 'done' | 'snoozed';

export const turnOutcomes = {
	answered: 'answered',
	promised: 'promised',
	started: 'started',
	finished: 'finished',
	confirmed: 'confirmed',
	failed: 'failed',
	done: 'done',
	snoozed: 'snoozed'
} as const;

export const turnOutcomeOrder: TurnOutcome[] = Object.values(turnOutcomes);

/** The outcomes that fit each kind of item. Anything can be put off; a chase is put off once it is sent. */
export const outcomesByKind: Record<AgendaKind, TurnOutcome[]> = {
	information: [turnOutcomes.answered, turnOutcomes.promised, turnOutcomes.snoozed],
	setup: [turnOutcomes.answered, turnOutcomes.promised, turnOutcomes.snoozed],
	testing: [turnOutcomes.confirmed, turnOutcomes.failed, turnOutcomes.snoozed],
	task: [turnOutcomes.started, turnOutcomes.finished, turnOutcomes.promised, turnOutcomes.answered, turnOutcomes.snoozed],
	promise: [turnOutcomes.done, turnOutcomes.snoozed],
	todo: [turnOutcomes.done, turnOutcomes.snoozed],
	chase: [turnOutcomes.snoozed]
};

/** Outcomes that carry no words of the person's: a tick, or putting it off. */
export const wordlessOutcomes: TurnOutcome[] = [turnOutcomes.done, turnOutcomes.snoozed];

export function parseTurnOutcome(value: unknown): TurnOutcome | null {
	return turnOutcomeOrder.find((outcome) => outcome === value) ?? null;
}

/** Why the outcome does not fit the item, or null when it does. */
export function outcomeRefusal(kind: AgendaKind, outcome: TurnOutcome): string | null {
	const fitting = outcomesByKind[kind];
	if (fitting.includes(outcome)) return null;
	return `A ${kind} item is answered ${fitting.join(', ')}, not ${outcome}. Nothing was recorded.`;
}
