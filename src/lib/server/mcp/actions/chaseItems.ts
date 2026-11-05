import { bugsFirst } from '$lib/data/bugsFirst';
import type { ChaseItem } from './chaseList';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { Todo } from '$lib/server/todos/todoRecord';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';
import type { WhatPersonOwes } from '$lib/server/owed/whatPersonOwes';

/** What one person owes on these projects as things to chase them for, bugs first. */
export function chaseItemsOwedBy(owes: WhatPersonOwes, projectIds: string[]): ChaseItem[] {
	const { person, questions, assigned, named, todos } = owes;
	const personId = person.accountId;
	const answers = questions.map((question) => answerItem(personId, question));
	const askedSubjectIds = new Set(questions.map((question) => question.subjectId));
	const tasks = [...assigned, ...named].filter((task) => !askedSubjectIds.has(task.id));
	const work = tasks.map((task) => workItem(personId, task));
	const promised = todos.filter((todo) => isPromiseOnProjects(todo, projectIds));
	const promises = promised.map((todo) => promiseItem(personId, todo));
	return bugsFirst([...answers, ...work, ...promises], subjectTitle);
}

function subjectTitle(item: ChaseItem): string {
	const { subject } = item;
	return subject.title;
}

function answerItem(personId: string, question: WaitingQuestion): ChaseItem {
	const { subjectKind: kind, subjectId: id, subjectTitle: title, projectName } = question;
	return {
		personId,
		subject: { kind, id, title, projectName },
		reason: 'answer',
		askKind: question.askKind,
		askedById: question.authorAccountId,
		question: question.body,
		since: question.createdAt
	};
}

function workItem(personId: string, task: GlobalTask): ChaseItem {
	const { id, title, projectName } = task;
	const subject = { kind: 'task' as const, id, title, projectName };
	return { personId, subject, reason: 'work', askKind: null, askedById: task.requestedBy, question: null, since: null };
}

function isPromiseOnProjects(todo: Todo, projectIds: string[]): boolean {
	if (todo.taskId === null) return false;
	return projectIds.includes(todo.projectId ?? '');
}

function promiseItem(personId: string, todo: Todo): ChaseItem {
	const subject = { kind: 'task' as const, id: todo.taskId ?? '', title: todo.taskTitle ?? '', projectName: todo.projectName ?? '' };
	return { personId, subject, reason: 'promise', askKind: null, askedById: null, question: todo.title, since: todo.createdAt };
}
