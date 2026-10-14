const PostgresErrorCode = {
	UndefinedTable: '42P01',
	UndefinedColumn: '42703',
	UndefinedFunction: '42883'
} as const;

const PostgrestErrorCode = {
	RelationshipNotInSchema: 'PGRST200',
	FunctionNotInSchema: 'PGRST202',
	ColumnNotInSchema: 'PGRST204',
	TableNotInSchema: 'PGRST205'
} as const;

const notYetMigratedCodes: ReadonlySet<string> = new Set([
	...Object.values(PostgresErrorCode),
	...Object.values(PostgrestErrorCode)
]);

/**
 * Whether a database failure means a merged migration has not been run yet: the table, column,
 * relationship or function the code reads does not exist. Production deploys on merge and the
 * migration runs afterwards, so readers on every page's path answer empty in that window rather
 * than fail.
 */
export function isSchemaNotYetMigrated(failure: unknown): boolean {
	if (typeof failure !== 'object' || failure === null) return false;
	const code = String((failure as { code?: unknown }).code ?? '');
	return notYetMigratedCodes.has(code);
}
