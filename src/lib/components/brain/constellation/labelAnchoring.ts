import { Vector3, type PerspectiveCamera } from 'three';
import { BRAIN_HALF_HEIGHT, BRAIN_HALF_LENGTH, BRAIN_HALF_WIDTH } from './brainShape';
import type { LabelBox } from './labelPlacement';

/** The view the labels are placed in: the camera, and the size of the brain on the screen. */
export type LabelScreen = { camera: PerspectiveCamera; widthPixels: number; heightPixels: number };

export type LabelSize = { width: number; height: number };

type ScreenPoint = { x: number; y: number };

const brainCoverSelector = '[data-covers-brain]';
const BEYOND_THE_CAMERA = 1;
const RING_CLEARANCE_PIXELS = 16;
const CELL_CLEARANCE_PIXELS = 10;
const OUTLINE_SHARE = 0.92;
const NUDGE_GAP_PIXELS = 4;
const NUDGES = [0, 1, -1, 2, -2];
const straightUp = { x: 0, y: -1 };
const signs = [-1, 1];
const brainCorners = signs.flatMap((across) =>
	signs.flatMap((up) => signs.map((along) => new Vector3(across * BRAIN_HALF_WIDTH, up * BRAIN_HALF_HEIGHT, along * BRAIN_HALF_LENGTH)))
);
const projected = new Vector3();

/** Places for an area's name on a ring just outside the brain, in line with its lobe, tried in turn. */
export function placesOnTheRing(anchor: Vector3, size: LabelSize, screen: LabelScreen): LabelBox[] {
	const corners = brainCorners.map((corner) => screenPointOf(corner, screen));
	const lobe = screenPointOf(anchor, screen);
	if (lobe === null || corners.some((corner) => corner === null)) return [];
	const xs = corners.map((corner) => (corner as ScreenPoint).x);
	const ys = corners.map((corner) => (corner as ScreenPoint).y);
	const centre = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
	const radii = { x: ((Math.max(...xs) - Math.min(...xs)) / 2) * OUTLINE_SHARE, y: ((Math.max(...ys) - Math.min(...ys)) / 2) * OUTLINE_SHARE };
	const heading = headingFrom(centre, lobe);
	const reach = 1 / Math.hypot(heading.x / radii.x, heading.y / radii.y) + RING_CLEARANCE_PIXELS;
	const edge = { x: centre.x + heading.x * reach, y: centre.y + heading.y * reach };
	const left = heading.x >= 0 ? edge.x : edge.x - size.width;
	return NUDGES.map((nudge) => ({ left, top: edge.y - size.height / 2 + nudge * (size.height + NUDGE_GAP_PIXELS), ...size }));
}

/** Places for a name beside its cell: above it, else below it. */
export function placesBesideTheCell(anchor: Vector3, size: LabelSize, screen: LabelScreen): LabelBox[] {
	const cell = screenPointOf(anchor, screen);
	if (cell === null) return [];
	const left = cell.x - size.width / 2;
	const above = { left, top: cell.y - size.height - CELL_CLEARANCE_PIXELS, ...size };
	const below = { left, top: cell.y + CELL_CLEARANCE_PIXELS, ...size };
	return [above, below];
}

/** How wide the panel laid over the brain is, if one is: a panel over it says so with data-covers-brain. */
export function coverWidthIn(container: Element | null): number {
	const cover = container?.querySelector<HTMLElement>(brainCoverSelector);
	return cover?.offsetWidth ?? 0;
}

function headingFrom(centre: ScreenPoint, point: ScreenPoint): ScreenPoint {
	const across = point.x - centre.x;
	const down = point.y - centre.y;
	const length = Math.hypot(across, down);
	if (length < 1) return straightUp;
	return { x: across / length, y: down / length };
}

function screenPointOf(anchor: Vector3, screen: LabelScreen): ScreenPoint | null {
	projected.copy(anchor).project(screen.camera);
	if (projected.z > BEYOND_THE_CAMERA) return null;
	return { x: ((projected.x + 1) / 2) * screen.widthPixels, y: ((1 - projected.y) / 2) * screen.heightPixels };
}
