import { parseProjectStatus, type ProjectStatus } from '$lib/data/projectStatus';

export const defaultBranchWhenUnset = 'main';
export const refactorEveryDeploysWhenUnset = 10;

export type Project = {
	id: string;
	ownerId: string;
	name: string;
	description: string;
	status: ProjectStatus;
	priority: number;
	clientId: string | null;
	repositoryUrl: string;
	environmentUrl: string;
	defaultBranch: string;
	refactorEveryDeploys: number;
	lastRefactorRaisedAt: string | null;
	kitVersion: string;
	createdAt: string;
};

export function parseProjectRecord(row: Record<string, unknown>): Project {
	return {
		id: row.id as string,
		ownerId: row.owner_id as string,
		name: row.name as string,
		description: row.description as string,
		status: parseProjectStatus(row.status),
		priority: row.priority as number,
		clientId: (row.client_id as string) ?? null,
		repositoryUrl: (row.repository_url as string) ?? '',
		environmentUrl: (row.environment_url as string) ?? '',
		defaultBranch: (row.default_branch as string) || defaultBranchWhenUnset,
		refactorEveryDeploys: parseRefactorEveryDeploys(row.refactor_every_deploys),
		lastRefactorRaisedAt: (row.last_refactor_raised_at as string) ?? null,
		kitVersion: (row.kit_version as string) ?? '',
		createdAt: row.created_at as string
	};
}

export function parseRefactorEveryDeploys(value: unknown): number {
	if (value === null || value === undefined || value === '') return refactorEveryDeploysWhenUnset;
	const every = Math.trunc(Number(value));
	if (Number.isNaN(every) || every < 0) return refactorEveryDeploysWhenUnset;
	return every;
}
