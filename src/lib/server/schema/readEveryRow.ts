/** How many rows the database hands back for one request, at most. */
export const rowsPerRequest = 1000;

type RowPage = PromiseLike<{ data: unknown[] | null; error: unknown }>;

/** Every row a query matches, read a page at a time, so a long answer is never cut short at the first page. */
export async function readEveryRow(
	readPage: (firstRow: number, lastRow: number) => RowPage
): Promise<Record<string, unknown>[]> {
	const rows: Record<string, unknown>[] = [];
	for (let firstRow = 0; ; firstRow += rowsPerRequest) {
		const { data, error } = await readPage(firstRow, firstRow + rowsPerRequest - 1);
		if (error) throw error;
		const page = (data ?? []) as Record<string, unknown>[];
		rows.push(...page);
		if (page.length < rowsPerRequest) return rows;
	}
}
