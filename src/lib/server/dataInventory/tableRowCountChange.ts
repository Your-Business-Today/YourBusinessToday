/** One table's row count in an earlier reading and a later one; null where the table was not there. */
export type TableRowCountChange = {
	tableName: string;
	earlierCount: number | null;
	laterCount: number | null;
};

/** Every table in either reading, by name, with its count in each. */
export function compareRowCounts(
	earlier: Record<string, number>,
	later: Record<string, number>
): TableRowCountChange[] {
	const tableNames = [...new Set([...Object.keys(earlier), ...Object.keys(later)])].sort();
	return tableNames.map((tableName) => ({
		tableName,
		earlierCount: earlier[tableName] ?? null,
		laterCount: later[tableName] ?? null
	}));
}

/** Whether the table holds fewer rows in the later reading; a table that is gone holds none. */
export function hasLostRows(change: TableRowCountChange): boolean {
	if (change.earlierCount === null) return false;
	return (change.laterCount ?? 0) < change.earlierCount;
}
