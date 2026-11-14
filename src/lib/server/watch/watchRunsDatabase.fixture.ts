type Row = Record<string, unknown>;

/** The watch run log as a stand-in holds it: each run's source, when it started and its note. */
export const watchRunRows: Row[] = [];

export function clearWatchRuns(): void {
	watchRunRows.length = 0;
}

/** A stand-in read of the watch run log that filters by equality and from a moment, orders, and takes the first rows. */
function readWatchRuns() {
	const filters: ((row: Row) => boolean)[] = [];
	let ordering: { column: string; isAscending: boolean } | null = null;
	let rowLimit = Number.POSITIVE_INFINITY;
	let isFirstOnly = false;
	const chain = {
		select: () => chain,
		eq: (column: string, value: unknown) => (filters.push((row) => row[column] === value), chain),
		gte: (column: string, value: string) => (filters.push((row) => String(row[column]) >= value), chain),
		order: (column: string, options: { ascending: boolean }) => ((ordering = { column, isAscending: options.ascending }), chain),
		limit: (count: number) => ((rowLimit = count), chain),
		maybeSingle: () => ((isFirstOnly = true), chain),
		then: (resolve: (value: unknown) => unknown) => {
			const rows = ordered(watchRunRows.filter((row) => filters.every((filter) => filter(row))), ordering).slice(0, rowLimit);
			return resolve({ data: isFirstOnly ? (rows[0] ?? null) : rows, error: null });
		}
	};
	return chain;
}

function ordered(rows: Row[], ordering: { column: string; isAscending: boolean } | null): Row[] {
	if (ordering === null) return rows;
	const { column, isAscending } = ordering;
	const direction = isAscending ? 1 : -1;
	return [...rows].sort((first, second) => direction * String(first[column]).localeCompare(String(second[column])));
}

/** A database stand-in that reads the watch run log from its own rows and every other table from the one given. */
export function withWatchRuns<Database extends { from: (table: string) => unknown }>(database: Database): Database {
	return { ...database, from: (table: string) => (table === 'watch_runs' ? readWatchRuns() : database.from(table)) };
}
