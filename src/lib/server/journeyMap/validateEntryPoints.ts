import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { fieldsOf, isRefused, readList, readRequiredText } from '$lib/server/filing/filedText';
import { readRouteOfView } from './mapValues';
import type { EntryPoint } from '$lib/data/journeyMap/journeyMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Where people arrive: each at a view of this version, and no way of arriving given twice for one view. */
export function validateEntryPoints(value: unknown, routes: Set<string>): EntryPoint[] | Refusal {
	const candidates = readList(value, limits.mostEntryPoints, 'entryPoints');
	if (isRefused(candidates)) return candidates;
	const entryPoints: EntryPoint[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const entryPoint = readEntryPoint(candidate, `Entry point ${index + 1}`, routes);
		if (isRefused(entryPoint)) return entryPoint;
		const isRepeated = entryPoints.some(
			(filed) => filed.route === entryPoint.route && filed.arrivesBy === entryPoint.arrivesBy
		);
		if (isRepeated) return { refusal: `Entry point ${index + 1} repeats ${entryPoint.route}: give each once.` };
		entryPoints.push(entryPoint);
	}
	return entryPoints;
}

function readEntryPoint(candidate: unknown, label: string, routes: Set<string>): EntryPoint | Refusal {
	const fields = fieldsOf(candidate);
	const route = readRouteOfView(fields.route, `${label} route`, routes);
	if (isRefused(route)) return route;
	const arrivesBy = readRequiredText(fields.arrivesBy, { field: `${label} arrivesBy`, limit: limits.arrivesByLength });
	if (isRefused(arrivesBy)) return arrivesBy;
	return { route, arrivesBy };
}
