type Row = Record<string, unknown>;

type Filter = (row: Row) => boolean;

/** A write the stand-in was asked for: which table, which kind, and the row or columns it was given. */
export type LedgerWrite = { table: string; kind: string; row?: unknown };

/** What each stand-in table holds; filled by a test, changed by the writes it makes. */
export const ledgerTables: Record<string, Row[]> = {};

export const ledgerWrites: LedgerWrite[] = [];

let insertedCount = 0;

const insertedIdDigits = 12;

export function clearLedgerTables(): void {
	for (const table of Object.keys(ledgerTables)) delete ledgerTables[table];
	ledgerWrites.length = 0;
	insertedCount = 0;
}

/** The id the stand-in gives the nth row it inserts, counting from one across every table, shaped as the database's. */
function insertedId(count: number): string {
	return `00000000-0000-4000-8000-${String(count).padStart(insertedIdDigits, '0')}`;
}

/**
 * A stand-in for the books tables that keeps what is written: a read answers the rows its equality and list filters
 * let through, an insert keeps its rows with new ids, an update changes the rows it filters, and a delete takes them out.
 */
export const ledgerDatabase = {
	from: (table: string) => {
		const filters: Filter[] = [];
		let write: (rows: Row[]) => Row[] = (rows) => rows;
		let isFirstOnly = false;
		const held = () => ledgerTables[table] ?? [];
		const record = (kind: string, row?: unknown) => ledgerWrites.push({ table, kind, row });
		const chain = {
			select: () => chain,
			order: () => chain,
			range: () => chain,
			eq: (column: string, value: unknown) => {
				filters.push((row) => row[column] === undefined || row[column] === value);
				return chain;
			},
			in: (column: string, values: unknown[]) => {
				filters.push((row) => values.includes(row[column]));
				return chain;
			},
			insert: (given: Row | Row[]) => {
				record('insert', given);
				const rows = (Array.isArray(given) ? given : [given]).map((row) => ({ id: insertedId((insertedCount += 1)), ...row }));
				ledgerTables[table] = [...held(), ...rows];
				write = () => rows;
				return chain;
			},
			update: (columns: Row) => {
				record('update', columns);
				write = (matched) => matched.map((row) => Object.assign(row, columns));
				return chain;
			},
			delete: () => {
				record('delete');
				write = (matched) => {
					ledgerTables[table] = held().filter((row) => !matched.includes(row));
					return matched;
				};
				return chain;
			},
			single: () => ((isFirstOnly = true), chain),
			maybeSingle: () => ((isFirstOnly = true), chain),
			then: (resolve: (value: unknown) => unknown) => {
				const rows = write(held().filter((row) => filters.every((filter) => filter(row))));
				const data = isFirstOnly ? (rows[0] ?? null) : rows;
				return resolve({ data, error: null });
			}
		};
		return chain;
	}
};
