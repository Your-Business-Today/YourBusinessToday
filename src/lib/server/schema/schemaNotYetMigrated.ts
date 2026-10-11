const PostgresErrorCode = {
	UndefinedTable: '42P01',
	UndefinedColumn: '42703'
} as const;

const PostgrestErrorCode = {
	RelationshipNotInSchema: 'PGRST200',
	ColumnNotInSchema: 'PGRST204',
	TableNotInSchema: 'PGRST205'
} as const;

const notYetMigratedCodes: ReadonlySet<string> = new Set([
	...Object.values(PostgresErrorCode),
	...Object.values(PostgrestErrorCode)
]);

/**
 * Whether a database failure means a merged migration has not been run yet: the table, column or
 * relationship the code reads does not exist. Production deploys on merge and the migration is run
 * by hand afterwards, so readers on every page's path answer empty in that window rather than fail.
 */
export function isSchemaNotYetMigrated(failure: unknown): boolean {
	if (typeof failure !== 'object' || failure === null) return false;
	const code = String((failure as { code?: unknown }).code ?? '');
	return notYetMigratedCodes.has(code);
}
