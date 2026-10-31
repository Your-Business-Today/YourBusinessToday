import { departmentMeanings, departmentOrder, departmentRefusal, parseDepartment, type Department } from '$lib/data/department';
import { readOptionalText, textField } from '../actionTypes';
import { reachableGoal } from '../projectAccess';
import type { McpCaller } from '../resolveMcpCaller';

const meaningsInBrief = departmentOrder.map((department) => `${department} (${departmentMeanings[department]})`);

export const departmentField = textField(
	`The project tab it sits on: ${meaningsInBrief.join('; ')}. Development unless said otherwise`
);

export type DepartmentRefusal = { refusal: string };

export type DepartmentReading = Department | undefined | DepartmentRefusal;

export function isDepartmentRefused(reading: DepartmentReading): reading is DepartmentRefusal {
	return typeof reading === 'object';
}

/** The department named, or undefined when none is, or a refusal when the value names no department. */
export function readDepartment(input: Record<string, unknown>): DepartmentReading {
	const named = readOptionalText(input, 'department');
	if (named === null) return undefined;
	return parseDepartment(named) ?? { refusal: departmentRefusal };
}

/** A new task's department: the one named, else its goal's, else development. */
export async function chooseTaskDepartment(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<DepartmentReading> {
	const named = readDepartment(input);
	if (named !== undefined) return named;
	const goalId = readOptionalText(input, 'goalId');
	if (goalId === null) return undefined;
	const goal = await reachableGoal(caller, goalId);
	return goal?.department;
}
