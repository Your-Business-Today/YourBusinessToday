import { databaseKinds, migrationsPathWhenUnset, type DatabaseKind } from './databaseKind';

/** What a project says about its database: the kind, how sqlcmd reaches it, and where its migrations live. A blank user is an Entra-only server. */
export type ProjectDatabase = {
	kind: DatabaseKind;
	server: string;
	name: string;
	user: string;
	migrationsPath: string;
};

export const longestDatabaseDetail = 255;

const detailLabels: Record<keyof Omit<ProjectDatabase, 'kind'>, string> = {
	server: 'The database server',
	name: 'The database name',
	user: 'The database user',
	migrationsPath: 'The migrations folder'
};

const folderPathPattern = /^(?!\/)(?!.*\/\/)(?!.*\.\.)[A-Za-z0-9._/-]*(?<!\/)$/;

export const noDatabase: ProjectDatabase = {
	kind: databaseKinds.none,
	server: '',
	name: '',
	user: '',
	migrationsPath: ''
};

/** Why a project's database details cannot be saved, or null when they can. */
export function projectDatabaseRefusal(database: ProjectDatabase): string | null {
	const tooLong = Object.entries(detailLabels).find(([field]) => isTooLong(database[field as keyof typeof detailLabels]));
	if (tooLong !== undefined) return `${tooLong[1]} is at most ${longestDatabaseDetail} characters.`;
	if (!folderPathPattern.test(database.migrationsPath)) {
		return 'The migrations folder is a path inside the repository, such as migrations or api/Data/Migrations.';
	}
	if (database.kind === databaseKinds.azureSql) return azureSqlRefusal(database);
	return null;
}

/** The folder the project's migrations are read from: the one it names, else the one its kind usually has. */
export function migrationsFolderOf(database: ProjectDatabase): string {
	if (database.migrationsPath !== '') return database.migrationsPath;
	return migrationsPathWhenUnset[database.kind];
}

export function signsInThroughEntra(database: ProjectDatabase): boolean {
	return database.user === '';
}

export function hasDatabase(database: ProjectDatabase): boolean {
	return database.kind !== databaseKinds.none;
}

function azureSqlRefusal(database: ProjectDatabase): string | null {
	const missing = (['server', 'name'] as const).find((field) => database[field] === '');
	if (missing === undefined) return null;
	return `${detailLabels[missing]} is needed to write the sqlcmd for an Azure SQL project.`;
}

function isTooLong(value: string): boolean {
	return value.length > longestDatabaseDetail;
}
