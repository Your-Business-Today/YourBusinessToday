import {
	clampRank,
	dropPlacements,
	moveDirections,
	topRank,
	type BesidePlacement,
	type MoveDirection
} from './rankedSet';

/**
 * Where a row lands when it is moved among only the rows a person can see:
 * beside a shown neighbour, so rows the filters hide keep their places.
 */
export type ShownPlacement = { targetId: string; placement: BesidePlacement };

/** One place up or down among the shown rows. */
export function placementForMove(
	shownIds: string[],
	movedId: string,
	direction: MoveDirection
): ShownPlacement | null {
	const movedIndex = shownIds.indexOf(movedId);
	if (movedIndex === -1) return null;
	const isMovingUp = direction === moveDirections.up;
	const neighbourId = shownIds[isMovingUp ? movedIndex - 1 : movedIndex + 1];
	if (neighbourId === undefined) return null;
	return { targetId: neighbourId, placement: isMovingUp ? dropPlacements.before : dropPlacements.after };
}

/** To a numbered position among the shown rows, 1 at the top. */
export function placementForPosition(
	shownIds: string[],
	movedId: string,
	position: number
): ShownPlacement | null {
	const movedIndex = shownIds.indexOf(movedId);
	if (movedIndex === -1) return null;
	const targetIndex = clampRank(position, shownIds.length) - topRank;
	if (targetIndex === movedIndex) return null;
	const isMovingUp = targetIndex < movedIndex;
	return { targetId: shownIds[targetIndex], placement: isMovingUp ? dropPlacements.before : dropPlacements.after };
}
