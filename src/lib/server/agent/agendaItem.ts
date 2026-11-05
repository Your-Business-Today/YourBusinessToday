import type { GoalHorizon } from '$lib/data/goalHorizon';

/**
 * What the YBT agent can raise with a person, one at a time: an ask of each kind, a task in their
 * name, a to-do they promised on a task, one on their own list, or someone to chase.
 */
export type AgendaKind = 'information' | 'setup' | 'testing' | 'task' | 'promise' | 'todo' | 'chase' | 'build' | 'goal';

export const agendaKinds = {
	information: 'information',
	setup: 'setup',
	testing: 'testing',
	task: 'task',
	promise: 'promise',
	todo: 'todo',
	chase: 'chase',
	build: 'build',
	goal: 'goal'
} as const;

/**
 * The order the agent works through, after every bug and the quick answers: information, setup, testing,
 * tasks, promises, to-dos, chasing and building; a long term goal to make current comes after everything.
 */
export const agendaKindOrder: AgendaKind[] = ['information', 'setup', 'testing', 'task', 'promise', 'todo', 'chase', 'build', 'goal'];

/** The kinds that ask only a quick answer of the person, a yes, a no or a fact, so they come first. */
export const quickAnswerKinds: AgendaKind[] = ['information', 'setup'];

export const agendaKindLabels: Record<AgendaKind, string> = {
	information: 'Information to give',
	setup: 'Something to set up',
	testing: 'A feature to test',
	task: 'A task in your name',
	promise: 'Something you promised',
	todo: 'On your own list',
	chase: 'Someone to chase',
	build: 'Work to build',
	goal: 'A long term goal to make current'
};

/** What an item is said on: a goal or a task. */
export const subjectKinds = { goal: 'goal', task: 'task' } as const;

/** The goal an item's work counts toward, and whether that is current or long term. */
export type AgendaGoal = { id: string; title: string; horizon: GoalHorizon };

/** One thing to raise. Its key names it across chats, so a snooze or an answer finds it again. */
export type AgendaItem = {
	key: string;
	kind: AgendaKind;
	isBug: boolean;
	projectId: string | null;
	projectName: string | null;
	subjectKind: 'goal' | 'task' | null;
	subjectId: string | null;
	subjectTitle: string;
	ask: string;
	askedById: string | null;
	since: string | null;
	goal: AgendaGoal | null;
	taskPriority: number | null;
	storyPoints: number | null;
};

const keySeparator = ':';

/** The key of an item: its kind of record and the record's id, such as message:… or task:…. */
export function agendaKey(recordKind: string, recordId: string): string {
	return `${recordKind}${keySeparator}${recordId}`;
}

/** The record an item's key names: the to-do, message, task or person after its kind. */
export function agendaRecordId(key: string): string {
	return key.slice(key.indexOf(keySeparator) + 1);
}
