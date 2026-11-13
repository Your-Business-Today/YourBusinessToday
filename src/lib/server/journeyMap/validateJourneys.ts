import { journeyMapLimits as limits } from '$lib/data/journeyMap/journeyMapLimits';
import { fieldsOf, isRefused, readList, readRequiredText } from '$lib/server/companyContext/contextText';
import { readKey, readOptionalKey } from './mapValues';
import { validateJourneySteps } from './validateJourneySteps';
import type { Journey } from '$lib/data/journeyMap/journeyMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type JourneyWords = { name: string; role: string; story: string };

/** Every journey of a version: each key once, and every step at a view of this version. */
export function validateJourneys(value: unknown, routes: Set<string>): Journey[] | Refusal {
	const candidates = readList(value, limits.mostJourneys, 'journeys');
	if (isRefused(candidates)) return candidates;
	const journeys: Journey[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const journey = readJourney(candidate, index + 1, routes);
		if (isRefused(journey)) return journey;
		const isRepeated = journeys.some((filed) => filed.key === journey.key);
		if (isRepeated) return { refusal: `Journey ${index + 1} repeats the key "${journey.key}": give each journey once.` };
		journeys.push(journey);
	}
	return journeys;
}

function readJourney(candidate: unknown, position: number, routes: Set<string>): Journey | Refusal {
	const fields = fieldsOf(candidate);
	const key = readKey(fields.key, `Journey ${position} key`);
	if (isRefused(key)) return key;
	const label = `Journey "${key}"`;
	const words = readJourneyWords(fields, label);
	if (isRefused(words)) return words;
	const stationKey = readOptionalKey(fields.stationKey, `${label} stationKey`);
	if (isRefused(stationKey)) return stationKey;
	const steps = validateJourneySteps(fields.steps, { label, routes });
	if (isRefused(steps)) return steps;
	return { key, ...words, stationKey, steps };
}

function readJourneyWords(fields: Record<string, unknown>, label: string): JourneyWords | Refusal {
	const name = readRequiredText(fields.name, { field: `${label} name`, limit: limits.journeyNameLength });
	if (isRefused(name)) return name;
	const role = readRequiredText(fields.role, { field: `${label} role`, limit: limits.roleLength });
	if (isRefused(role)) return role;
	const story = readRequiredText(fields.story, { field: `${label} story`, limit: limits.storyLength });
	if (isRefused(story)) return story;
	return { name, role, story };
}
