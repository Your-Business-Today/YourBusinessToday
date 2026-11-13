import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { fieldsOf, isRefused, readList, readOptionalText } from '$lib/server/companyContext/contextText';
import { readRouteOfView } from './mapValues';
import type { JourneyStep } from '$lib/data/journeyMap/journeyMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Which journey the steps belong to, as a refusal names it, and the routes of the version's views. */
export type StepContext = { label: string; routes: Set<string> };

/** A journey's steps in order: at least one, and each at a view of this version. */
export function validateJourneySteps(value: unknown, context: StepContext): JourneyStep[] | Refusal {
	const { label, routes } = context;
	const candidates = readList(value, limits.mostStepsInAJourney, `${label} steps`);
	if (isRefused(candidates)) return candidates;
	if (candidates.length === 0) return { refusal: `${label} has no steps: give its views in order.` };
	const steps: JourneyStep[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const step = readStep(candidate, `${label} step ${index + 1}`, routes);
		if (isRefused(step)) return step;
		steps.push(step);
	}
	return steps;
}

function readStep(candidate: unknown, label: string, routes: Set<string>): JourneyStep | Refusal {
	const fields = fieldsOf(candidate);
	const route = readRouteOfView(fields.route, `${label} route`, routes);
	if (isRefused(route)) return route;
	const does = readOptionalText(fields.does, { field: `${label} does`, limit: limits.doesLength });
	if (isRefused(does)) return does;
	return { route, does };
}
