import { accountNameLookup } from '$lib/data/accountNames';
import { departmentTag } from '$lib/data/department';
import { formatBritishDate } from '$lib/data/britishDate';
import { internalStatusLabels, todoStatusWords } from '$lib/data/internalStatus';
import { isPastDue } from '$lib/data/dueDate';
import { isTaskDone } from '$lib/data/taskStatus';
import { isTodoOpen } from '$lib/data/todo';
import { subtaskIndent, underGoalPhrase } from './backlogLineParts';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
import type { Todo } from '$lib/server/todos/todoRecord';

export type InternalItemFacts = {
	people: ProjectPerson[];
	assigneeIdsByTask: Map<string, string[]>;
	todosByTask: Record<string, Todo[]>;
};

type ItemContext = Omit<InternalItemFacts, 'people'> & { goals: Goal[]; nameOf: (accountId: string) => string };

/** An Internal work item as the board shows it — status in monday.com's words, owner, due date — with its to-dos and subtasks beneath. */
export function internalItemLines(task: TaskTreeNode, goals: Goal[], facts: InternalItemFacts): string[] {
	const { people, ...keyedFacts } = facts;
	const context = { ...keyedFacts, goals, nameOf: accountNameLookup(people) };
	return itemLines(task, '', context);
}

function itemLines(task: TaskTreeNode, indent: string, context: ItemContext): string[] {
	const deeper = `${indent}${subtaskIndent}`;
	const todos = context.todosByTask[task.id] ?? [];
	return [
		itemLine(task, indent, context),
		...todos.map((todo) => todoLine(todo, deeper, context.nameOf)),
		...task.subtasks.flatMap((subtask) => itemLines(subtask, deeper, context))
	];
}

function itemLine(task: TaskTreeNode, indent: string, context: ItemContext): string {
	const ownerIds = context.assigneeIdsByTask.get(task.id) ?? [];
	const owners = ownerIds.length === 0 ? 'no owner' : `owner ${ownerIds.map(context.nameOf).join(', ')}`;
	const due = duePhrase(task.dueDate, isTaskDone(task.status));
	const goal = underGoalPhrase(task.goalId, context.goals);
	const place = `priority ${task.priority}, id: ${task.id}`;
	return `${indent}${task.title}${departmentTag(task.department)} — ${internalStatusLabels[task.status]}, ${owners}, ${due}${goal} (${place})`;
}

function todoLine(todo: Todo, indent: string, nameOf: (accountId: string) => string): string {
	const owner = todo.ownerAccountId === null ? 'anyone on the project' : nameOf(todo.ownerAccountId);
	const due = duePhrase(todo.dueDate, !isTodoOpen(todo.status));
	return `${indent}- to-do: ${todo.title} — ${todoStatusWords[todo.status]}, ${owner}, ${due} (to-do id: ${todo.id})`;
}

function duePhrase(dueDate: string | null, isFinished: boolean): string {
	if (dueDate === null) return 'no due date';
	const pastDue = isPastDue(dueDate, isFinished) ? ', past due' : '';
	return `due ${formatBritishDate(dueDate)}${pastDue}`;
}
