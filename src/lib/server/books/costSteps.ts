/** A move of a cost in words, and where to read how the cost stands when it cannot be told whether it happened. */
export function costMoveWords(supplier: string, moved: string) {
	return { move: `the cost from ${supplier} was ${moved}`, whereItStands: `list_expenses says where the cost from ${supplier} stands` };
}
