import { agendaKey, agendaKinds, type AgendaItem } from './agendaItem';
import { defaultAskKind } from '$lib/data/askKind';
import { isBugTitle } from '$lib/data/developmentKind';
import { isDevelopment } from '$lib/data/department';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { Todo } from '$lib/server/todos/todoRecord';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';
import type { WhatPersonOwes } from '$lib/server/owed/whatPersonOwes';

/** Everything a person owes as things the agent can raise: their asks, the jobs in their name, and their to-dos. Building is never theirs. */
export function agendaFromOwes(owes: WhatPersonOwes): AgendaItem[] {
	const { questions, assigned, named, todos } = owes;
	const jobs = [...assigned, ...named].filter((task) => !isDevelopment(task.department));
	return [...questions.map(askItem), ...jobs.map(taskItem), ...todos.map(todoItem)];
}

function askItem(question: WaitingQuestion): AgendaItem {
	return {
		key: agendaKey('message', question.id),
		kind: question.askKind ?? defaultAskKind,
		isBug: isBugTitle(question.subjectTitle),
		projectId: question.projectId,
		projectName: question.projectName,
		subjectKind: question.subjectKind,
		subjectId: question.subjectId,
		subjectTitle: question.subjectTitle,
		ask: question.body,
		askedById: question.authorAccountId,
		since: question.createdAt,
		goal: null,
		taskPriority: null,
		storyPoints: null
	};
}

function taskItem(task: GlobalTask): AgendaItem {
	return {
		key: agendaKey('task', task.id),
		kind: agendaKinds.task,
		isBug: isBugTitle(task.title),
		projectId: task.projectId,
		projectName: task.projectName,
		subjectKind: 'task',
		subjectId: task.id,
		subjectTitle: task.title,
		ask: task.details,
		askedById: task.requestedBy,
		since: task.createdAt,
		goal: null,
		taskPriority: null,
		storyPoints: null
	};
}

function todoItem(todo: Todo): AgendaItem {
	const isPromise = todo.taskId !== null;
	return {
		key: agendaKey('todo', todo.id),
		kind: isPromise ? agendaKinds.promise : agendaKinds.todo,
		isBug: isBugTitle(todo.taskTitle ?? ''),
		projectId: todo.projectId,
		projectName: todo.projectName,
		subjectKind: isPromise ? 'task' : null,
		subjectId: todo.taskId,
		subjectTitle: todo.taskTitle ?? todo.title,
		ask: todo.title,
		askedById: todo.createdBy,
		since: todo.dueDate ?? todo.createdAt,
		goal: null,
		taskPriority: null,
		storyPoints: null
	};
}
