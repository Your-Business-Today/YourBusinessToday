import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainKindsWithFields } from '$lib/data/businessBrainDomainRules';
import { domainQuestionKind, type DomainQuestion } from '$lib/data/domainQuestions';
import { lifecycleRowsOf, type DomainLifecycleRow } from '$lib/data/domainLifecycleRows';
import { thingStationRoles } from '$lib/data/workflowMap/stationThings';
import { thingStationsOf, type ThingStation } from '$lib/data/workflowMap/thingStations';
import { aNamed } from './questionWording';
import { askedAbout, thingSubject, vocabularyOf, type DomainHeld } from './domainHeld';
import type { DomainThing } from '$lib/data/domainReading';

/** Statement 6: every record says what makes one, and every status it has is reached by a task on today's map. */
export function recordGaps(held: DomainHeld): DomainQuestion[] {
	const { things } = held.domain;
	const records = things.filter((thing) => domainKindsWithFields.includes(thing.kind));
	const stations = thingStationsOf(held.map, vocabularyOf(held));
	return records.flatMap((record) => [...identityGaps(record), ...statusGaps(record, stations, held.map !== null)]);
}

function identityGaps(record: DomainThing): DomainQuestion[] {
	const isUnsaid = record.kind === domainPageKinds.entity && record.identity === null;
	if (!isUnsaid) return [];
	const question = `Nothing says what makes ${aNamed(record.title)}. What brings one into being, and what tells two apart?`;
	return [askedAbout(domainQuestionKind.identity, question, thingSubject(record), record)];
}

function statusGaps(record: DomainThing, stations: ThingStation[], isMapFiled: boolean): DomainQuestion[] {
	if (!isMapFiled) return [];
	const rows = lifecycleRowsOf(record, stations);
	const isMadeAtAll = stations.some(({ thingSlug, role, status }) => thingSlug === record.slug && role === thingStationRoles.produces && status === null);
	const isReached = ({ reachedBy }: DomainLifecycleRow, position: number) => reachedBy.length > 0 || (position === 0 && isMadeAtAll);
	const unreached = rows.filter((row, position) => !isReached(row, position));
	return unreached.map(({ status }) => {
		const question = `Nothing moves ${aNamed(record.title)} to ${status}. Which task does?`;
		return askedAbout(domainQuestionKind.status, question, thingSubject(record), record);
	});
}
