import { parseDatabaseKind } from '$lib/data/databaseKind';
import { parseProjectStatus, type ProjectStatus } from '$lib/data/projectStatus';
import type { ProjectDatabase } from '$lib/data/projectDatabase';

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
	kitVersionReadAt: string | null;
	database: ProjectDatabase;
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
		kitVersionReadAt: (row.kit_version_read_at as string) ?? null,
		database: parseProjectDatabase(row),
		createdAt: row.created_at as string
	};
}

function parseProjectDatabase(row: Record<string, unknown>): ProjectDatabase {
	return {
		kind: parseDatabaseKind(row.database_kind),
		server: (row.database_server as string) ?? '',
		name: (row.database_name as string) ?? '',
		user: (row.database_user as string) ?? '',
		migrationsPath: (row.migrations_path as string) ?? ''
	};
}

export function parseRefactorEveryDeploys(value: unknown): number {
	if (value === null || value === undefined || value === '') return refactorEveryDeploysWhenUnset;
	const every = Math.trunc(Number(value));
	if (Number.isNaN(every) || every < 0) return refactorEveryDeploysWhenUnset;
	return every;
}
