import { parseDatabaseKind } from '$lib/data/databaseKind';
import type { ProjectDatabase } from '$lib/data/projectDatabase';

/** One migration file a merge brought to a project's default branch, waiting to be run or run. */
export type DatabaseTask = {
	id: string;
	projectId: string;
	projectName: string;
	repositoryUrl: string;
	database: ProjectDatabase;
	filePath: string;
	commitSha: string;
	branch: string;
	raisedAt: string;
	runAt: string | null;
	runByAccountId: string | null;
};

export const databaseTaskColumns =
	'*, projects(name, repository_url, database_kind, database_server, database_name, database_user, migrations_path)';

export function parseDatabaseTaskRecord(row: Record<string, unknown>): DatabaseTask {
	const project = (row.projects as Record<string, unknown> | null) ?? {};
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		projectName: (project.name as string) ?? '',
		repositoryUrl: (project.repository_url as string) ?? '',
		database: {
			kind: parseDatabaseKind(project.database_kind),
			server: (project.database_server as string) ?? '',
			name: (project.database_name as string) ?? '',
			user: (project.database_user as string) ?? '',
			migrationsPath: (project.migrations_path as string) ?? ''
		},
		filePath: row.file_path as string,
		commitSha: (row.commit_sha as string) ?? '',
		branch: (row.branch as string) ?? '',
		raisedAt: row.raised_at as string,
		runAt: (row.run_at as string) ?? null,
		runByAccountId: (row.run_by_account_id as string) ?? null
	};
}

export function isPending(task: DatabaseTask): boolean {
	return task.runAt === null;
}
