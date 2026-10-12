import { parsePublicUrl } from '$lib/server/clients/parsePublicUrl';
import { isRefusedSourceHost } from '$lib/data/sightingRules';
import { longestObservationHeadline, observationKindOrder, parseObservationKind, type ObservationSeed } from '$lib/data/observationRules';

export const observationNeedsSubject = 'An observation is about a company number on the register or a sighting id.';
export const observationNeedsHeadline = 'Say in one line what was observed.';
export const observationKindRefusal = `The kind is one of ${observationKindOrder.join(', ')}.`;
export const observationNeedsPublicPage = 'The source must be a public http(s) page the observation was read on.';
export const observationSourceRefused = 'That page is behind a login or on a network whose terms forbid reading it this way.';

/** Why the observation cannot be recorded as it stands, or null when every value fits its column. */
export function validateObservation(seed: ObservationSeed): string | null {
	const { headline } = seed;
	if (seed.companyNumber === '' && seed.sightingId === '') return observationNeedsSubject;
	if (parseObservationKind(seed.kind) === null) return observationKindRefusal;
	if (headline === '') return observationNeedsHeadline;
	if (headline.length > longestObservationHeadline) return `The headline is at most ${longestObservationHeadline} characters.`;
	const page = parsePublicUrl(seed.sourceUrl);
	if (page === null) return observationNeedsPublicPage;
	if (isRefusedSourceHost(page.hostname)) return observationSourceRefused;
	return null;
}
