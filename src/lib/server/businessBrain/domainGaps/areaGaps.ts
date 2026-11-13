import { domainQuestionKind, type DomainQuestion } from '$lib/data/domainQuestions';
import { thingStationRoles } from '$lib/data/workflowMap/stationThings';
import { thingStationsOf, type ThingStation } from '$lib/data/workflowMap/thingStations';
import { aNamed } from './questionWording';
import { askedAbout, thingSubject, vocabularyOf, type DomainHeld } from './domainHeld';
import type { DomainThing } from '$lib/data/domainReading';

/** A record made in one area and taken in by a task whose work is another's. */
type Passing = { record: DomainThing; toSlug: string; toTitle: string };

/** Statement 9: two areas that pass work have a row saying how they relate. A task's area is the area of what it produces. */
export function areaGaps(held: DomainHeld): DomainQuestion[] {
	const { map } = held;
	if (map === null) return [];
	const stations = thingStationsOf(map, vocabularyOf(held));
	const passings = map.lines.flatMap((line) => line.stations).flatMap((station) => passingsAt(held, stations, station.key));
	const unrelated = passings.filter((passing) => !isRelated(held, passing));
	return firstOfEachPair(unrelated).map(({ record, toTitle }) => {
		const passed = aNamed(record.title);
		const question = `${record.areaTitle} passes ${passed} to ${toTitle}. Who decides what ${passed} must hold by then?`;
		return askedAbout(domainQuestionKind.relationship, question, thingSubject(record), record);
	});
}

function passingsAt({ domain }: DomainHeld, stations: ThingStation[], stationKey: string): Passing[] {
	const thingsOf = (role: string) =>
		stations.filter((station) => station.stationKey === stationKey && station.role === role).flatMap(({ thingSlug }) => domain.things.filter((thing) => thing.slug === thingSlug));
	const workAreas = thingsOf(thingStationRoles.produces);
	return thingsOf(thingStationRoles.takesIn).flatMap((record) =>
		workAreas.filter((made) => made.areaSlug !== record.areaSlug).map((made) => ({ record, toSlug: made.areaSlug, toTitle: made.areaTitle }))
	);
}

function isRelated({ domain }: DomainHeld, { record, toSlug }: Passing): boolean {
	const pair = new Set([record.areaSlug, toSlug]);
	return domain.areaRelationships.some(({ fromContextSlug, toContextSlug }) => pair.has(fromContextSlug) && pair.has(toContextSlug));
}

function firstOfEachPair(passings: Passing[]): Passing[] {
	const keyOf = ({ record, toSlug }: Passing) => [record.areaSlug, toSlug].sort().join(':');
	const keys = passings.map(keyOf);
	return passings.filter((passing, position) => keys.indexOf(keyOf(passing)) === position);
}
