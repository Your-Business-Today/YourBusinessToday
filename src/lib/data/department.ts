export type Department = 'development' | 'infrastructure' | 'administration' | 'sales' | 'marketing';

export const departments = {
	development: 'development',
	infrastructure: 'infrastructure',
	administration: 'administration',
	sales: 'sales',
	marketing: 'marketing'
} as const;

export const departmentOrder: Department[] = [
	departments.development,
	departments.infrastructure,
	departments.administration,
	departments.sales,
	departments.marketing
];

export const defaultDepartment: Department = departments.development;

export const departmentLabels: Record<Department, string> = {
	development: 'Development',
	infrastructure: 'Infrastructure',
	administration: 'Administration',
	sales: 'Sales',
	marketing: 'Marketing'
};

export const departmentMeanings: Record<Department, string> = {
	development: 'built by Claude, each task ending in a pull request',
	infrastructure: 'the systems the project runs on, set by hand: cloud settings, secrets, servers, hosting accounts',
	administration: 'the running of the business: insurance, accounts, registrations, contracts',
	sales: 'winning the work: leads, calls, quotes, follow-ups',
	marketing: 'being found: the website copy, posts, listings, campaigns'
};

export const onlyDevelopmentIsBuilt =
	'Only a development task is built: an infrastructure, administration, sales or marketing task is done by ' +
	'the person it is assigned to, so it never goes in the build queue.';

export const onlyDevelopmentIsAutocomplete =
	'Only a development task can be autocomplete: an infrastructure, administration, sales or marketing task is done by ' +
	'the person it is assigned to, so its autocomplete stays off.';

export const departmentRefusal = `A department is one of ${departmentOrder.join(', ')}.`;

/** The department named, or null when the value names none. */
export function parseDepartment(value: unknown): Department | null {
	const named = String(value ?? '').trim().toLowerCase() as Department;
	return departmentOrder.includes(named) ? named : null;
}

/** A stored department, read as development when the column is missing or empty. */
export function readStoredDepartment(value: unknown): Department {
	return parseDepartment(value) ?? defaultDepartment;
}

export function isDevelopment(department: Department): boolean {
	return department === departments.development;
}

/** How a task line names its department: nothing for development, the tab's name for the others. */
export function departmentTag(department: Department): string {
	if (isDevelopment(department)) return '';
	return ` [${departmentLabels[department]}]`;
}

/** Who carries a task of the department out, as a task's description says it. */
export function departmentLine(department: Department): string {
	const label = departmentLabels[department];
	if (isDevelopment(department)) return `Department: ${label} — Claude builds it, and it ends in a pull request.`;
	return `Department: ${label} — the person it is assigned to does it and marks it done; nothing is built.`;
}
