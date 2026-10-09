export type DatabaseKind = 'none' | 'azure_sql' | 'supabase';

export const databaseKinds = { none: 'none', azureSql: 'azure_sql', supabase: 'supabase' } as const;

export const databaseKindLabels: Record<DatabaseKind, string> = {
	none: 'No database',
	azure_sql: 'Azure SQL',
	supabase: 'Supabase'
};

export const databaseKindOrder: DatabaseKind[] = ['none', 'azure_sql', 'supabase'];

/** Where each kind of project keeps its migration files unless it says otherwise. */
export const migrationsPathWhenUnset: Record<DatabaseKind, string> = {
	none: '',
	azure_sql: 'api/Data/Migrations',
	supabase: 'migrations'
};

export function parseDatabaseKind(value: unknown): DatabaseKind {
	const knownKind = databaseKindOrder.find((kind) => kind === value);
	return knownKind ?? databaseKinds.none;
}

export function isDatabaseKind(value: unknown): value is DatabaseKind {
	return databaseKindOrder.some((kind) => kind === value);
}
