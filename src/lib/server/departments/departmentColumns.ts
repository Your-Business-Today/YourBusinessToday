import { defaultDepartment, type Department } from '$lib/data/department';

/** The department column for a new goal or task; development is the column's default, so it is left to it. */
export function departmentColumns(department: Department | undefined): Record<string, unknown> {
	const chosen = department ?? defaultDepartment;
	if (chosen === defaultDepartment) return {};
	return { department: chosen };
}
