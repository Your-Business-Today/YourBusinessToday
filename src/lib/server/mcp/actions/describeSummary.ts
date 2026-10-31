import { askSections, asksOfKind } from './describeAskSections';
import { latestMessageSentence, unnamedAccountNotice } from './describeOwedTasks';
import { todoLine } from './describeTodos';
import { askKinds } from '$lib/data/askKind';
import { departmentLabels, isDevelopment } from '$lib/data/department';
import { countOf } from '$lib/data/countOf';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { OwedTasks } from './owedTasks';
import type { Todo } from '$lib/server/todos/todoRecord';
import type { WaitingQuestions } from './waitingQuestionsFor';

/** Everything a summary is made from: the asks waiting on the person, their to-dos, and what is still in their name. */
export type SummarySources = {
	waiting: WaitingQuestions;
	todos: Todo[];
	owed: OwedTasks;
	viewerId: string;
};

export const nothingOwed = 'Nothing waits on you, nothing is on your to-do list, and no task is in your name.';

const stillInYourName =
	'Development tasks in your name (older work that is really an ask, or a job for a business ' +
	'department: offer to turn each into one, and building is never theirs)';

/** What the person has to do, by kind: information, setup, testing, their department tasks, then their to-dos. Building is Claude's. */
export function describeSummary(sources: SummarySources): string[] {
	const { owed } = sources;
	const unnamed = owed.name === null ? [unnamedAccountNotice, ''] : [];
	if (isNothingOwed(sources)) return [...unnamed, nothingOwed];
	return [
		...unnamed,
		totalsLine(sources),
		'',
		...askSections(sources.waiting, sources.viewerId),
		...businessTaskSection(owed),
		...todoSection(sources.todos),
		...inYourNameSection(owed)
	];
}

function isNothingOwed({ waiting, todos, owed }: SummarySources): boolean {
	const { questions } = waiting;
	const { assigned, named } = owed;
	return questions.length + todos.length + assigned.length + named.length === 0;
}

function totalsLine({ waiting, todos, owed }: SummarySources): string {
	const information = asksOfKind(waiting, askKinds.information).length;
	const setup = asksOfKind(waiting, askKinds.setup).length;
	const testing = asksOfKind(waiting, askKinds.testing).length;
	const parts = [
		`${countOf(information, 'answer')} to give`,
		`${countOf(setup, 'thing')} to set up`,
		`${countOf(testing, 'feature')} to test`,
		`${countOf(businessTasksOf(owed).length, 'task')} to do`,
		`${countOf(todos.length, 'to-do')}`
	];
	return `In all: ${parts.join(', ')}. Everything to be built is Claude's.`;
}

function todoSection(todos: Todo[]): string[] {
	if (todos.length === 0) return [];
	return [`## Your to-dos (${todos.length})`, ...todos.map(todoLine), ''];
}

/** The administration, sales and marketing tasks assigned to the person: theirs to do and mark done. */
function businessTasksOf(owed: OwedTasks): GlobalTask[] {
	return owed.assigned.filter((task) => !isDevelopment(task.department));
}

function businessTaskSection(owed: OwedTasks): string[] {
	const tasks = businessTasksOf(owed);
	if (tasks.length === 0) return [];
	return [`## Your tasks (${tasks.length})`, ...tasks.map((task) => workLine(task, owed)), ''];
}

function inYourNameSection(owed: OwedTasks): string[] {
	const developmentTasks = owed.assigned.filter((task) => isDevelopment(task.department));
	const tasks = [...developmentTasks, ...owed.named];
	if (tasks.length === 0) return [];
	return [`## ${stillInYourName} (${tasks.length})`, ...tasks.map((task) => workLine(task, owed)), ''];
}

function workLine(task: GlobalTask, owed: OwedTasks): string {
	const status = taskStatusLabels[task.status];
	const where = `${task.projectName}, ${departmentLabels[task.department]}, task id: ${task.id}`;
	return `- "${task.title}", ${status} (${where}). ${latestMessageSentence(task, owed)}`;
}
