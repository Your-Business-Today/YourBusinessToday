/** The items a few at a time, in order, for a loop that must not fan out all at once. */
export function inBatches<Item>(items: Item[], batchSize: number): Item[][] {
	const batches: Item[][] = [];
	for (let start = 0; start < items.length; start += batchSize) batches.push(items.slice(start, start + batchSize));
	return batches;
}

/** The work done on each batch in turn, one batch finished before the next starts, its answers gathered in order. */
export async function eachBatchInTurn<Item, Answer>(
	items: Item[],
	batchSize: number,
	work: (batch: Item[]) => Promise<Answer[]>
): Promise<Answer[]> {
	const answers: Answer[] = [];
	for (const batch of inBatches(items, batchSize)) answers.push(...(await work(batch)));
	return answers;
}
