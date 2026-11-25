import { askKinds, defaultAskKind, type AskKind } from './askKind';
import type { Department } from './department';
import type { TaskStatus } from './taskStatus';

/** The few facts of an open task a count needs. */
export type CountedTask = { projectName: string; department: Department; status: TaskStatus };

/** What one person has open, counted: nothing is filtered out but done work. */
export type OpenWorkCount = {
	assignedCount: number;
	followUpCount: number;
	namedCount: number;
	answerCount: number;
	setupCount: number;
	todoCount: number;
	byProject: Map<string, number>;
	byDepartment: Map<Department, number>;
	byStatus: Map<TaskStatus, number>;
	total: number;
};

type Counting = { assigned: CountedTask[]; followUps: CountedTask[]; named: CountedTask[]; askKinds: (AskKind | null)[]; todoCount: number };

/** Every open item counted once, the tasks broken down by project, department and status. */
export function countOpenWork(counting: Counting): OpenWorkCount {
	const { assigned, followUps, named, todoCount } = counting;
	const kinds = counting.askKinds.map((kind) => kind ?? defaultAskKind);
	const answerCount = kinds.filter((kind) => kind === askKinds.information).length;
	const setupCount = kinds.filter((kind) => kind === askKinds.setup).length;
	const tasks = [...assigned, ...followUps, ...named];
	return {
		assignedCount: assigned.length,
		followUpCount: followUps.length,
		namedCount: named.length,
		answerCount,
		setupCount,
		todoCount,
		byProject: tally(tasks, (task) => task.projectName),
		byDepartment: tally(tasks, (task) => task.department),
		byStatus: tally(tasks, (task) => task.status),
		total: tasks.length + kinds.length + todoCount
	};
}

function tally<Key>(tasks: CountedTask[], keyOf: (task: CountedTask) => Key): Map<Key, number> {
	const counts = new Map<Key, number>();
	for (const task of tasks) counts.set(keyOf(task), (counts.get(keyOf(task)) ?? 0) + 1);
	return counts;
}
