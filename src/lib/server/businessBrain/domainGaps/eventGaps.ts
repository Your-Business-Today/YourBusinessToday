import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainQuestionKind, type DomainQuestion } from '$lib/data/domainQuestions';
import { phraseMeaningOf, wordingOf } from '$lib/data/workflowMap/phraseInDomain';
import { stationsOnLines, theNamed } from '$lib/server/workflowMap/mapGaps/stationsOnLines';
import { askedAbout, thingSubject, vocabularyOf, type DomainHeld } from './domainHeld';
import type { DomainThing } from '$lib/data/domainReading';
import type { MapHandover } from '$lib/data/workflowMap/workflowMap';

/** A record reaching a status at a hand-over: the change an event should mark. */
type StatusChange = { handover: MapHandover; record: DomainThing; status: string };

/** Statement 7: every hand-over that passes a record in a status has an event marking that change. */
export function eventGaps(held: DomainHeld): DomainQuestion[] {
	const { map, domain } = held;
	if (map === null) return [];
	const lineNames = new Map(stationsOnLines(map).map((station) => [station.key, station.lineName]));
	const changes = map.handovers.flatMap((handover) => statusChangeAt(held, handover));
	const unmarked = changes.filter((change) => !isMarked(domain.things, change));
	return firstOfEachChange(unmarked).map(({ handover, record, status }) => {
		const from = lineNames.get(handover.fromKey) ?? handover.fromKey;
		const to = lineNames.get(handover.toKey) ?? handover.toKey;
		const question = `The ${from} hands ${theNamed(handover.handedOver)} to the ${to}. Is the event ${record.title} ${status.toLowerCase()}?`;
		return askedAbout(domainQuestionKind.event, question, thingSubject(record), record);
	});
}

function statusChangeAt(held: DomainHeld, handover: MapHandover): StatusChange[] {
	const { things } = held.domain;
	const meaning = phraseMeaningOf(vocabularyOf(held), handover.handedOver);
	const status = meaning?.status ?? null;
	const record = things.find((thing) => thing.slug === meaning?.thingSlug);
	if (record === undefined || status === null) return [];
	return [{ handover, record, status }];
}

function isMarked(things: DomainThing[], { record, status }: StatusChange): boolean {
	const isMarking = (event: DomainThing) => event.marksThingSlug === record.slug && wordingOf(event.marksStatus ?? '') === wordingOf(status);
	return things.some((thing) => thing.kind === domainPageKinds.domainEvent && isMarking(thing));
}

function firstOfEachChange(changes: StatusChange[]): StatusChange[] {
	const keyOf = ({ record, status }: StatusChange) => `${record.slug}:${wordingOf(status)}`;
	const keys = changes.map(keyOf);
	return changes.filter((change, position) => keys.indexOf(keyOf(change)) === position);
}
