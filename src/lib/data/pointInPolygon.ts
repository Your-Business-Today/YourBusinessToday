/** A point and a ring in any flat plane: pairs of x then y. */
export type PlanePoint = [number, number];
export type Ring = PlanePoint[];

/** Whether the point lies inside the outer ring and outside every hole, by counting the edges a ray to the east crosses. */
export function isPointInPolygon(point: PlanePoint, rings: Ring[]): boolean {
	const [outer, ...holes] = rings;
	if (outer === undefined || !isPointInRing(point, outer)) return false;
	return !holes.some((hole) => isPointInRing(point, hole));
}

export function isPointInRing([x, y]: PlanePoint, ring: Ring): boolean {
	let isInside = false;
	for (let at = 0, before = ring.length - 1; at < ring.length; before = at, at += 1) {
		const [xAt, yAt] = ring[at];
		const [xBefore, yBefore] = ring[before];
		const straddles = yAt > y !== yBefore > y;
		if (!straddles) continue;
		const crossingX = ((xBefore - xAt) * (y - yAt)) / (yBefore - yAt) + xAt;
		if (x < crossingX) isInside = !isInside;
	}
	return isInside;
}
