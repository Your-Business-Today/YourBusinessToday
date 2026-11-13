import type { Point } from './layout/lineMapGeometry';

export function pathThrough(corners: Point[]): string {
	return corners.map((corner, index) => `${index === 0 ? 'M' : 'L'}${corner.x} ${corner.y}`).join('');
}

export function returnArrowPath(centre: Point): string {
	const { x, y } = centre;
	return `M${x - 3} ${y - 3}A4 4 0 1 1 ${x - 4} ${y + 1}M${x - 3} ${y - 6}V${y - 3}H${x}`;
}
