import { databaseKinds, type DatabaseKind } from './databaseKind';
import { migrationNameOf } from './migrationFiles';
import type { ProjectDatabase } from './projectDatabase';

/** What the admin runs for one migration: the command to copy, and the file on GitHub it runs. */
export type DatabaseTaskInstruction = {
	command: string;
	fileAddress: string | null;
};

type MigrationToRun = {
	repositoryUrl: string;
	commitSha: string;
	branch: string;
	filePath: string;
};

const runMigrationScript = './scripts/run-migration.sh';

export function databaseTaskInstruction(
	database: ProjectDatabase,
	migration: MigrationToRun
): DatabaseTaskInstruction {
	return {
		command: commandFor(database, migration.filePath),
		fileAddress: migrationFileAddress(migration)
	};
}

/** The sqlcmd the admin runs for an Azure SQL migration, in the shape every portal uses. */
export function sqlcmdFor(database: ProjectDatabase, filePath: string): string {
	const logFile = `${migrationNameOf(filePath)}.log`;
	return `sqlcmd -S ${database.server} -d ${database.name} -U ${database.user} -i ${filePath} -b -o ${logFile}`;
}

/** The file as it landed on the default branch, pinned to the commit that brought it. */
export function migrationFileAddress(migration: MigrationToRun): string | null {
	if (migration.repositoryUrl === '') return null;
	const ref = migration.commitSha === '' ? migration.branch : migration.commitSha;
	return `${migration.repositoryUrl.replace(/\/+$/, '')}/blob/${ref}/${migration.filePath}`;
}

const commandsByKind: Record<DatabaseKind, (database: ProjectDatabase, filePath: string) => string> = {
	none: () => '',
	azure_sql: sqlcmdFor,
	supabase: (_database, filePath) => `${runMigrationScript} ${filePath}`
};

function commandFor(database: ProjectDatabase, filePath: string): string {
	if (database.kind === databaseKinds.none) return '';
	return commandsByKind[database.kind](database, filePath);
}
