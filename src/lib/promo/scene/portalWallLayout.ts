import type { Group } from 'three';
import { mix } from '../promoMotion';

type WallScreen = { id: string; column: number; isTopRow: boolean };

/** The portal pages on the wall, in the order they arrive: the owner's overview first, at the middle of the bottom row. */
export const wallScreens: WallScreen[] = [
	{ id: 'owner-overview', column: 0, isTopRow: false },
	{ id: 'valuation', column: -1, isTopRow: false },
	{ id: 'weekly-cashflow', column: 1, isTopRow: false },
	{ id: 'ai-skills', column: 0, isTopRow: true },
	{ id: 'control-centre', column: -1, isTopRow: true },
	{ id: 'rfis', column: 1, isTopRow: true }
];

export const wallShape = { width: 12, height: 7.5, gap: 0.9, radius: 30 };

const flight = { drop: 10, depth: 45, tumble: 0.5 };
const columnAngle = (wallShape.width + wallShape.gap) / wallShape.radius;
const rowHeight = (wallShape.height + wallShape.gap) / 2;

/** Sets a page on the curve of the wall, flown in from below and behind, and drawn into the middle as the film gathers. */
export function placeWallScreen(panel: Group, screen: WallScreen, arrived: number, gathered: number): void {
	const angle = screen.column * columnAngle;
	const away = 1 - arrived;
	const settled = 1 - gathered;
	const x = Math.sin(angle) * wallShape.radius;
	const y = (screen.isTopRow ? rowHeight : -rowHeight) - away * flight.drop;
	const z = wallShape.radius * (1 - Math.cos(angle)) - away * flight.depth;
	panel.position.set(mix(0, x, settled), mix(0, y, settled), mix(0, z, settled));
	panel.rotation.set(away * flight.tumble, -angle, 0);
	panel.scale.setScalar(settled);
}
