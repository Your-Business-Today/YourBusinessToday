/** The items a few at a time, in order, for a loop that must not fan out all at once. */
export function inBatches<Item>(items: Item[], batchSize: number): Item[][] {
	const batches: Item[][] = [];
	for (let start = 0; start < items.length; start += batchSize) batches.push(items.slice(start, start + batchSize));
	return batches;
}
