import { comparedWordingOf, singularOf } from './comparedWording';
import { candidateOf, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';
import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { isPastTense } from './pastTense';
import { wordingOf } from '$lib/data/workflowMap/phraseInDomain';
import type { DomainThing } from '$lib/data/domainReading';

/** Names that break the naming rules: a status named as its record, an event that is not its record first in the past tense, a record named in the plural. */
export function namingFaults(held: DomainCheckHeld): DomainCheckCandidate[] {
	const { things } = held.domain;
	return [...things.flatMap(statusNamedAsRecord), ...things.flatMap((thing) => eventMisworded(held, thing)), ...things.flatMap(recordInThePlural)];
}

function statusNamedAsRecord(thing: DomainThing): DomainCheckCandidate[] {
	const recordWording = comparedWordingOf(thing.title);
	const named = thing.statuses.filter((status) => comparedWordingOf(status) === recordWording);
	return named.map((status) => {
		const finding = `${thing.title} has a status called "${status}": a status is a describing word, never the record’s own name.`;
		return candidateOf(domainCheckKind.naming, finding, [thing]);
	});
}

function eventMisworded({ domain }: DomainCheckHeld, thing: DomainThing): DomainCheckCandidate[] {
	if (thing.kind !== domainPageKinds.domainEvent) return [];
	const marked = domain.things.find((each) => each.slug === thing.marksThingSlug);
	const recordTitle = marked?.title ?? null;
	const title = wordingOf(thing.title);
	const isRecordFirst = recordTitle === null || title.startsWith(wordingOf(recordTitle));
	const [, ...laterWords] = title.split(' ');
	const isInThePast = laterWords.some(isPastTense);
	if (isRecordFirst && isInThePast) return [];
	const example = recordTitle === null ? 'such as "Contract stack signed"' : `such as "${recordTitle} signed"`;
	const finding = `The event "${thing.title}" does not read as its record first in the past tense, ${example}. Is it an event, or a task?`;
	return [candidateOf(domainCheckKind.naming, finding, [thing])];
}

function recordInThePlural(thing: DomainThing): DomainCheckCandidate[] {
	if (thing.kind !== domainPageKinds.entity) return [];
	const lastWord = wordingOf(thing.title).split(' ').at(-1) ?? '';
	if (singularOf(lastWord) === lastWord) return [];
	const finding = `The record "${thing.title}" is named in the plural: a record is a singular noun, one of what the business keeps.`;
	return [candidateOf(domainCheckKind.naming, finding, [thing])];
}
