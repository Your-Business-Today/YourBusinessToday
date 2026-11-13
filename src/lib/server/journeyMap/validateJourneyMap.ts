import { commitShape } from '$lib/data/journeyMap/journeyMapLimits';
import { isRefused } from '$lib/server/filing/filedText';
import { validateEntryPoints } from './validateEntryPoints';
import { validateJourneys } from './validateJourneys';
import { validateMapLinks } from './validateMapLinks';
import { validateMapViews } from './validateMapViews';
import type { JourneyMapDraft } from '$lib/data/journeyMap/journeyMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Reads a whole version from a connector call and refuses the first value that does not fit its column. */
export function validateJourneyMap(input: Record<string, unknown>): JourneyMapDraft | Refusal {
	const commit = readCommit(input.commit);
	if (isRefused(commit)) return commit;
	const views = validateMapViews(input.views);
	if (isRefused(views)) return views;
	const routes = new Set(views.map((view) => view.route));
	const links = validateMapLinks(input.links, routes);
	if (isRefused(links)) return links;
	const entryPoints = validateEntryPoints(input.entryPoints, routes);
	if (isRefused(entryPoints)) return entryPoints;
	const journeys = validateJourneys(input.journeys, routes);
	if (isRefused(journeys)) return journeys;
	return { commit, views, links, entryPoints, journeys };
}

function readCommit(value: unknown): string | Refusal {
	const commit = typeof value === 'string' ? value.trim() : '';
	if (commitShape.test(commit)) return commit;
	return {
		refusal: 'commit must be the commit the map was read from: 7 to 40 lower-case hexadecimal characters.'
	};
}
