import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { fieldsOf, isRefused, readList, readOptionalText, readRequiredText } from '$lib/server/filing/filedText';
import { readRoute } from './mapValues';
import type { MapView } from '$lib/data/journeyMap/journeyMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type ViewWords = { name: string; purpose: string; shows: string | null };

/** Every view of a version: at least one, and each route once. */
export function validateMapViews(value: unknown): MapView[] | Refusal {
	const candidates = readList(value, limits.mostViews, 'views');
	if (isRefused(candidates)) return candidates;
	if (candidates.length === 0) return { refusal: 'views is empty: file every view of the product.' };
	const views: MapView[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const view = readView(candidate, index + 1);
		if (isRefused(view)) return view;
		const isRepeated = views.some((filed) => filed.route === view.route);
		if (isRepeated) return { refusal: `View ${index + 1} repeats the route ${view.route}: give each view once.` };
		views.push(view);
	}
	return views;
}

function readView(candidate: unknown, position: number): MapView | Refusal {
	const fields = fieldsOf(candidate);
	const route = readRoute(fields.route, `View ${position} route`);
	if (isRefused(route)) return route;
	const words = readViewWords(fields, `View ${route}`);
	if (isRefused(words)) return words;
	return { route, ...words };
}

function readViewWords(fields: Record<string, unknown>, label: string): ViewWords | Refusal {
	const name = readRequiredText(fields.name, { field: `${label} name`, limit: limits.viewNameLength });
	if (isRefused(name)) return name;
	const purpose = readRequiredText(fields.purpose, { field: `${label} purpose`, limit: limits.purposeLength });
	if (isRefused(purpose)) return purpose;
	const shows = readOptionalText(fields.shows, { field: `${label} shows`, limit: limits.showsLength });
	if (isRefused(shows)) return shows;
	return { name, purpose, shows };
}
