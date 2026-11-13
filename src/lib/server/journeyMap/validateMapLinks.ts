import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { fieldsOf, isRefused, readList, readOptionalText } from '$lib/server/filing/filedText';
import { readRouteOfView } from './mapValues';
import type { MapLink } from '$lib/data/journeyMap/journeyMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Which view leads to which: each names two different views of this version, and none is given twice. */
export function validateMapLinks(value: unknown, routes: Set<string>): MapLink[] | Refusal {
	const candidates = readList(value, limits.mostLinks, 'links');
	if (isRefused(candidates)) return candidates;
	const links: MapLink[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const link = readLink(candidate, `Link ${index + 1}`, routes);
		if (isRefused(link)) return link;
		const isRepeated = links.some((filed) => filed.fromRoute === link.fromRoute && filed.toRoute === link.toRoute);
		if (isRepeated)
			return { refusal: `Link ${index + 1} repeats ${link.fromRoute} to ${link.toRoute}: give each link once.` };
		links.push(link);
	}
	return links;
}

function readLink(candidate: unknown, label: string, routes: Set<string>): MapLink | Refusal {
	const fields = fieldsOf(candidate);
	const fromRoute = readRouteOfView(fields.fromRoute, `${label} fromRoute`, routes);
	if (isRefused(fromRoute)) return fromRoute;
	const toRoute = readRouteOfView(fields.toRoute, `${label} toRoute`, routes);
	if (isRefused(toRoute)) return toRoute;
	if (fromRoute === toRoute) return { refusal: `${label} goes from ${fromRoute} to itself.` };
	const how = readOptionalText(fields.how, { field: `${label} how`, limit: limits.howLength });
	if (isRefused(how)) return how;
	return { fromRoute, toRoute, how };
}
