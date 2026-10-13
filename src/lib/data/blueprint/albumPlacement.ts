/**
 * Where a cover sits in the album, by how far it is from the one being looked at: the chosen cover faces the
 * viewer, the rest fan out to either side turned towards it, like sleeves flicked through in a record crate.
 */
export type CoverPlacement = { transform: string; zIndex: number; isShown: boolean };

const albumSpacing = { firstStep: 150, laterStep: 46, turnDegrees: 58, sideScale: 0.82 } as const;
const coversShownEachSide = 7;
const frontLayer = 100;

export function coverPlacement(offset: number): CoverPlacement {
	const distance = Math.abs(offset);
	const isShown = distance <= coversShownEachSide;
	const zIndex = frontLayer - distance;
	if (offset === 0) return { transform: 'translateX(-50%) translateZ(60px)', zIndex, isShown };
	const direction = Math.sign(offset);
	const shift = albumSpacing.firstStep + (distance - 1) * albumSpacing.laterStep;
	const turn = -direction * albumSpacing.turnDegrees;
	const transform = `translateX(calc(-50% + ${direction * shift}px)) rotateY(${turn}deg) scale(${albumSpacing.sideScale})`;
	return { transform, zIndex, isShown };
}

/** The next index in a direction, held within the album's ends. */
export function steppedIndex(index: number, step: number, count: number): number {
	return Math.min(Math.max(index + step, 0), count - 1);
}
