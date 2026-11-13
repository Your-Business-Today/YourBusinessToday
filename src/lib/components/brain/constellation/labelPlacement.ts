/** Where a label would sit on the screen, in pixels from the top left of the brain. */
export type LabelBox = { left: number; top: number; width: number; height: number };

/** The part of the brain's screen a label may sit in, in pixels: below its controls, left of any panel over it. */
export type ScreenBounds = { topPixels: number; widthPixels: number; heightPixels: number };

const GAP_PIXELS = 6;

/**
 * Where each label goes, taken in order: each takes the first of its places that is on the screen and
 * overlaps no label already placed, and a label with no such place is not shown at all.
 */
export function labelsThatFit(placesOfEach: LabelBox[][], bounds: ScreenBounds): (LabelBox | null)[] {
	const placed: LabelBox[] = [];
	return placesOfEach.map((places) => {
		const free = places.find((box) => isOnScreen(box, bounds) && placed.every((other) => !overlaps(box, other)));
		if (free === undefined) return null;
		placed.push(free);
		return free;
	});
}

function isOnScreen(box: LabelBox, bounds: ScreenBounds): boolean {
	const isInsideAcross = box.left >= 0 && box.left + box.width <= bounds.widthPixels;
	const isInsideDown = box.top >= bounds.topPixels && box.top + box.height <= bounds.heightPixels;
	return isInsideAcross && isInsideDown;
}

function overlaps(first: LabelBox, second: LabelBox): boolean {
	const isClearSideways = first.left + first.width + GAP_PIXELS <= second.left || second.left + second.width + GAP_PIXELS <= first.left;
	const isClearUpAndDown = first.top + first.height + GAP_PIXELS <= second.top || second.top + second.height + GAP_PIXELS <= first.top;
	return !(isClearSideways || isClearUpAndDown);
}
