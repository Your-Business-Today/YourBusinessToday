/** Puts items in the order their ids are ranked, keeping the given order among items whose ids are not ranked, last. */
export function orderByRankedIds<Item extends { id: string }>(items: Item[], rankedIds: string[]): Item[] {
	const unranked = rankedIds.length;
	const rankOf = new Map(rankedIds.map((id, rank) => [id, rank]));
	const rankOfItem = (item: Item) => rankOf.get(item.id) ?? unranked;
	return [...items].sort((first, second) => rankOfItem(first) - rankOfItem(second));
}
