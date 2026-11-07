import type { CardPlacement } from '../boardLayout';
import { liveColumn } from '../boardStory';
import { easeInOutCubic, mix, progressBetween } from '../promoMotion';
import { boardShape, columnX, slotY } from './boardShape';

export type CardPose = { x: number; y: number; lift: number; visibility: number };

export const cardMove = { beats: 0.9, lift: 2.6 };

function poseOf(placement: CardPlacement): CardPose {
	const isShown = placement.slot < boardShape.visibleSlots;
	return { x: columnX(placement.column), y: slotY(placement.slot), lift: 0, visibility: isShown ? 1 : 0 };
}

function mixPose(from: CardPose, to: CardPose, amount: number): CardPose {
	return {
		x: mix(from.x, to.x, amount),
		y: mix(from.y, to.y, amount),
		lift: 0,
		visibility: mix(from.visibility, to.visibility, amount)
	};
}

function liftDuring(placement: CardPlacement, progress: number): number {
	if (!placement.isColumnChange) return 0;
	return Math.sin(Math.PI * progress) * cardMove.lift;
}

/** Where a card is at a board beat: each move eases on from wherever the last had got to, arcing out of the board between columns. */
export function cardPoseAt(placements: CardPlacement[], boardBeats: number): CardPose {
	const [first, ...later] = placements;
	let pose = poseOf(first);
	let lift = 0;
	later.forEach((placement) => {
		const progress = progressBetween(boardBeats, placement.beat, placement.beat + cardMove.beats);
		pose = mixPose(pose, poseOf(placement), easeInOutCubic(progress));
		lift = Math.max(lift, liftDuring(placement, progress));
	});
	return { ...pose, lift };
}

/** The board beat a card reached Live, landing included; a card that never does is live from never. */
export function liveSinceBeat(placements: CardPlacement[]): number {
	const arrival = placements.find((placement) => placement.column === liveColumn);
	return arrival ? arrival.beat + cardMove.beats : Infinity;
}
