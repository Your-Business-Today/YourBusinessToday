/**
 * A ranked set is a list of rows that share a scope (a board, a project, a
 * sibling group, a queue) and carry one integer rank each. The invariant every
 * write keeps: within a scope the ranks are exactly 1..n, unique and contiguous,
 * with 1 at the top. Everything here is pure; the scope files load and save.
 */

import { topRank } from '$lib/data/topRank';

export { topRank };

export type DropPlacement = 'before' | 'after' | 'inside';

export const dropPlacements = { before: 'before', after: 'after', inside: 'inside' } as const;
export type BesidePlacement = Exclude<DropPlacement, 'inside'>;
export type MoveDirection = 'up' | 'down';

/** Ranks outside the set are pulled to its ends, so "priority 99" means last. */
export function clampRank(rank: number, count: number): number {
	if (count <= 0) return topRank;
	return Math.min(Math.max(rank, topRank), count);
}

/** Rows in rank order; rows with no rank yet go last, in the order given. */
export function orderByRank<Item extends { id: string }>(
	items: Item[],
	readRank: (item: Item) => number | null
): Item[] {
	return items
		.map((item, index) => ({ item, index, rank: readRank(item) }))
		.sort(byRankThenIndex)
		.map((entry) => entry.item);
}

type Ranked = { index: number; rank: number | null };

function byRankThenIndex(first: Ranked, second: Ranked): number {
	const firstRank = first.rank ?? Number.POSITIVE_INFINITY;
	const secondRank = second.rank ?? Number.POSITIVE_INFINITY;
	if (firstRank !== secondRank) return firstRank - secondRank;
	return first.index - second.index;
}

/** The order with one row lifted out and put back at the given rank. */
export function withItemAtRank<Item extends { id: string }>(
	itemsInOrder: Item[],
	movedId: string,
	rank: number
): Item[] | null {
	const movedItem = itemsInOrder.find((item) => item.id === movedId);
	if (movedItem === undefined) return null;
	const remainingItems = itemsInOrder.filter((item) => item.id !== movedId);
	const insertionIndex = clampRank(rank, itemsInOrder.length) - topRank;
	return [
		...remainingItems.slice(0, insertionIndex),
		movedItem,
		...remainingItems.slice(insertionIndex)
	];
}

/** The order with one row moved a single place up or down. */
export function withItemMovedByOne<Item extends { id: string }>(
	itemsInOrder: Item[],
	movedId: string,
	direction: MoveDirection
): Item[] | null {
	const currentIndex = itemsInOrder.findIndex((item) => item.id === movedId);
	if (currentIndex === -1) return null;
	const step = direction === 'up' ? -1 : 1;
	return withItemAtRank(itemsInOrder, movedId, currentIndex + step + topRank);
}

/** The order with one row dropped directly before or after another. */
export function withItemBeside<Item extends { id: string }>(
	itemsInOrder: Item[],
	movedId: string,
	targetId: string,
	placement: BesidePlacement
): Item[] | null {
	if (movedId === targetId) return null;
	const movedItem = itemsInOrder.find((item) => item.id === movedId);
	if (movedItem === undefined) return null;
	const remainingItems = itemsInOrder.filter((item) => item.id !== movedId);
	const targetIndex = remainingItems.findIndex((item) => item.id === targetId);
	if (targetIndex === -1) return null;
	const insertionIndex = placement === 'before' ? targetIndex : targetIndex + 1;
	return [
		...remainingItems.slice(0, insertionIndex),
		movedItem,
		...remainingItems.slice(insertionIndex)
	];
}
