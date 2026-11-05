import { describe, expect, it } from 'vitest';
import { chaseItemsOwedBy } from './chaseItems';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { Todo } from '$lib/server/todos/todoRecord';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';
import type { WhatPersonOwes } from '$lib/server/owed/whatPersonOwes';

const project = 'project-a';
const elsewhere = 'project-b';

const question = {
	authorAccountId: 'james',
	body: 'Which insurer?',
	createdAt: '2026-11-01T09:00:00Z',
	askKind: 'information',
	subjectKind: 'task',
	subjectId: 'insurance',
	subjectTitle: 'Buy cyber insurance',
	projectId: project,
	projectName: 'YBT'
} as unknown as WaitingQuestion;

const task = (id: string, title: string) =>
	({ id, title, projectId: project, projectName: 'YBT', requestedBy: 'nigel' }) as unknown as GlobalTask;

const todo = (id: string, projectId: string | null, taskId: string | null) =>
	({ id, title: `Promise ${id}`, projectId, taskId, taskTitle: 'Buy cyber insurance', projectName: 'YBT', createdAt: '2026-11-02T09:00:00Z' }) as unknown as Todo;

const owes: WhatPersonOwes = {
	person: { accountId: 'jeremy', accountIds: ['jeremy'], titleName: 'Jeremy' },
	questions: [question],
	assigned: [task('insurance', 'Buy cyber insurance'), task('terms', 'Add terms')],
	named: [task('login', 'FIX: Jeremy cannot sign in')],
	todos: [todo('on-task', project, 'insurance'), todo('errand', null, null), todo('hidden', elsewhere, 'other')]
};

describe('what a person owes, as things to chase', () => {
	const items = chaseItemsOwedBy(owes, [project]);

	it('puts bugs first', () => {
		const [first] = items;
		const { subject } = first;
		expect(subject.title).toBe('FIX: Jeremy cannot sign in');
	});

	it('lists a task once when an ask on it already waits on them', () => {
		const subjectIds = items.filter((item) => item.reason !== 'promise').map(({ subject }) => subject.id);
		expect(subjectIds.filter((subjectId) => subjectId === 'insurance')).toHaveLength(1);
	});

	it('names who asked for each task', () => {
		const askers = items.map(({ subject, askedById }) => [subject.id, askedById]);
		expect(askers).toContainEqual(['terms', 'nigel']);
	});

	it('keeps only promises on tasks on the viewer’s projects, never personal errands', () => {
		const promises = items.filter((item) => item.reason === 'promise').map((item) => item.question);
		expect(promises).toEqual(['Promise on-task']);
	});
});
