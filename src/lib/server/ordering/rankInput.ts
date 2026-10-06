import {
	dropPlacements,
	moveDirections,
	topRank,
	type DropPlacement,
	type MoveDirection
} from './rankedSet';

export function parseDropPlacement(value: unknown): DropPlacement {
	if (value === dropPlacements.after || value === dropPlacements.inside) return value;
	return dropPlacements.before;
}

export function parseMoveDirection(value: unknown): MoveDirection | null {
	if (value === moveDirections.up || value === moveDirections.down) return value;
	return null;
}

/** A rank as typed or spoken: a whole number, or null when it is not one. */
export function parseRank(value: unknown): number | null {
	if (value === null || value === undefined || value === '') return null;
	const rank = Number(value);
	if (!Number.isInteger(rank)) return null;
	return rank;
}

export const priorityNumberRefusal = 'Priority is a whole number, 1 for the top.';

/** A priority as a form gives it: a whole number from 1 up, or null when it is not one. */
export function parsePriorityNumber(value: unknown): number | null {
	const rank = parseRank(value);
	if (rank === null || rank < topRank) return null;
	return rank;
}
