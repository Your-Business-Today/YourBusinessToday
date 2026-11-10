import { contextPartKind } from './companyContext';
import type { CompanyContextVersion, ContextPart, ContextPartKind } from './companyContext';

/** An area of the business with the parts nearest it; the area is null for the parts linked to no area at all. */
export type ContextArea = { area: ContextPart | null; parts: ContextPart[] };

type Reach = { partKey: string; areaKey: string };

const kindsInsideAnArea: ContextPartKind[] = [
	contextPartKind.source,
	contextPartKind.record,
	contextPartKind.process,
	contextPartKind.role
];

/**
 * The areas of the business in order, the core first, each with the parts it reaches through the fewest links
 * and process steps; a part as near to two areas sits in the first. Parts that reach no area come last, together.
 */
export function areasOfContext(context: CompanyContextVersion): ContextArea[] {
	const areas = areasInOrder(context.parts);
	const areaKeyOfPart = nearestAreaOfEachPart(context, areas);
	const placedAreas = areas.map((area) => ({ area, parts: partsInArea(context.parts, areaKeyOfPart, area.key) }));
	const unplacedParts = partsInArea(context.parts, areaKeyOfPart, null);
	if (unplacedParts.length === 0) return placedAreas;
	return [...placedAreas, { area: null, parts: unplacedParts }];
}

function areasInOrder(parts: ContextPart[]): ContextPart[] {
	const areas = parts.filter((part) => part.kind === contextPartKind.context);
	return areas.sort((first, second) => Number(second.isCore) - Number(first.isCore) || byName(first, second));
}

function partsInArea(parts: ContextPart[], areaKeyOfPart: Map<string, string>, areaKey: string | null): ContextPart[] {
	const members = parts.filter(
		(part) => part.kind !== contextPartKind.context && (areaKeyOfPart.get(part.key) ?? null) === areaKey
	);
	return members.sort((first, second) => kindPosition(first) - kindPosition(second) || byName(first, second));
}

function nearestAreaOfEachPart(context: CompanyContextVersion, areas: ContextPart[]): Map<string, string> {
	const neighbours = neighboursOfEachPart(context);
	const areaKeys = new Set(areas.map((area) => area.key));
	const areaKeyOfPart = new Map<string, string>();
	let frontier: Reach[] = areas.map((area) => ({ partKey: area.key, areaKey: area.key }));
	while (frontier.length > 0) frontier = nextRing(frontier, neighbours, areaKeys, areaKeyOfPart);
	return areaKeyOfPart;
}

function nextRing(
	frontier: Reach[],
	neighbours: Map<string, string[]>,
	areaKeys: Set<string>,
	areaKeyOfPart: Map<string, string>
): Reach[] {
	const ring: Reach[] = [];
	for (const { partKey, areaKey } of frontier)
		for (const neighbour of neighbours.get(partKey) ?? []) {
			const isTaken = areaKeys.has(neighbour) || areaKeyOfPart.has(neighbour);
			if (isTaken) continue;
			areaKeyOfPart.set(neighbour, areaKey);
			ring.push({ partKey: neighbour, areaKey });
		}
	return ring;
}

function neighboursOfEachPart({ links, steps }: CompanyContextVersion): Map<string, string[]> {
	const neighbours = new Map<string, string[]>();
	const addNeighbour = (partKey: string, neighbour: string) =>
		neighbours.set(partKey, [...(neighbours.get(partKey) ?? []), neighbour]);
	const join = (first: string, second: string) => {
		addNeighbour(first, second);
		addNeighbour(second, first);
	};
	for (const link of links) join(link.fromKey, link.toKey);
	for (const step of steps) if (step.roleKey !== null) join(step.processKey, step.roleKey);
	return neighbours;
}

function kindPosition(part: ContextPart): number {
	return kindsInsideAnArea.indexOf(part.kind);
}

function byName(first: ContextPart, second: ContextPart): number {
	return first.name.localeCompare(second.name);
}
