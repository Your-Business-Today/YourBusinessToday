type Row = Record<string, unknown>;

/** What the stand-in books tables hold for one test, and the error the next write meets. */
export const heldRows = { account: null as Row | null, costCentre: null as Row | null, failure: null as Row | null };

export const writes: { table: string; row: Row }[] = [];

/** A stand-in for the books chart tables: answers each query with the one row the test holds. */
export const chartDatabase = {
	from: (table: string) => {
		const held = table === 'books_cost_centres' ? heldRows.costCentre : heldRows.account;
		const heldList = held === null ? [] : [held];
		let answer: { data: unknown; error: unknown } = { data: heldList, error: null };
		const recordWrite = (row: Row) => {
			writes.push({ table, row });
			answer = { data: heldList, error: heldRows.failure };
			return chain;
		};
		const takeOne = () => {
			answer = { data: held, error: answer.error };
			return chain;
		};
		const chain = {
			select: () => chain,
			eq: () => chain,
			order: () => chain,
			insert: recordWrite,
			update: recordWrite,
			single: takeOne,
			maybeSingle: takeOne,
			then: (resolve: (value: unknown) => unknown) => resolve(answer)
		};
		return chain;
	}
};
