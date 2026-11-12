import { badgeToneClasses, type BadgeTone } from '$lib/components/site/badgeTones';
import { internalStatusLabels, todoStatusWords } from '$lib/data/internalStatus';
import { taskStatusOrder, type TaskStatus } from '$lib/data/taskStatus';
import { todoStatusOrder, type TodoStatus } from '$lib/data/todo';
import type { Department } from '$lib/data/department';

export type StatusChoice = { value: string; label: string; tone: BadgeTone };

export const taskStatusTones: Record<TaskStatus, BadgeTone> = {
	backlog: 'notStarted',
	in_progress: 'warning',
	on_hold: 'negative',
	done: 'positive'
};

const todoStatusTones: Record<TodoStatus, BadgeTone> = { to_do: 'notStarted', doing: 'warning', done: 'positive' };

export const taskStatusChoices: StatusChoice[] = taskStatusOrder.map((status) => ({
	value: status,
	label: internalStatusLabels[status],
	tone: taskStatusTones[status]
}));

export const todoStatusChoices: StatusChoice[] = todoStatusOrder.map((status) => ({
	value: status,
	label: todoStatusWords[status],
	tone: todoStatusTones[status]
}));

/** A status as a coloured pill that is also the field it is changed in. */
export function statusPillClasses(tone: BadgeTone): string {
	const shape = 'cursor-pointer appearance-none rounded border-0 px-2 py-1 font-display text-xs font-medium';
	return `${shape} ${badgeToneClasses[tone]}`;
}

/** Each Internal work department's colour, carried by its group's header as monday.com colours its groups. */
export const groupToneClasses: Partial<Record<Department, string>> = {
	administration: 'border-daylight text-daylight',
	sales: 'border-go text-go',
	marketing: 'border-caution text-caution'
};

/** The same colours as a dot beside a department's name, where its jobs are listed in one table with the others'. */
export const departmentDotClasses: Partial<Record<Department, string>> = {
	administration: 'bg-daylight',
	sales: 'bg-go',
	marketing: 'bg-caution'
};

export const inPlaceFieldClasses =
	'rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-chalk-muted hover:border-hairline focus:border-hairline-strong';
