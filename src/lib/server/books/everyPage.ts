/** The most rows one read of the books tables answers, as the database hands them out. */
export const booksPageSize = 1000;

/** Every row a paged read finds, asking page after page until one comes back short. */
export async function readEveryPage<Row>(readPage: (pageStart: number, pageEnd: number) => Promise<Row[]>): Promise<Row[]> {
	const rows: Row[] = [];
	for (let pageStart = 0; ; pageStart += booksPageSize) {
		const page = await readPage(pageStart, pageStart + booksPageSize - 1);
		rows.push(...page);
		if (page.length < booksPageSize) return rows;
	}
}
