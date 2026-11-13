import { candidateOf, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, type DomainCheckCandidate } from '$lib/data/domainCheck';
import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { thingStationsOf } from '$lib/data/workflowMap/thingStations';
import { vocabularyOf } from '../domainGaps/domainHeld';
import type { DomainThing } from '$lib/data/domainReading';

const keptKinds: string[] = [domainPageKinds.entity, domainPageKinds.valueObject];

/** Records and details that nothing else holds on to: no rule governs them, no field refers to them and no task of today's map touches them. Asked only once a map is filed. */
export function untouchedThings(held: DomainCheckHeld): DomainCheckCandidate[] {
	const { map, domain } = held;
	if (map === null) return [];
	const touchedSlugs = new Set([
		...domain.rules.flatMap((rule) => [...rule.governs, rule.guardsThingSlug ?? '']),
		...domain.things.flatMap((thing) => thing.fields.map((field) => field.ref ?? '')),
		...thingStationsOf(map, vocabularyOf(held)).map((station) => station.thingSlug)
	]);
	const isUntouched = (thing: DomainThing) => keptKinds.includes(thing.kind) && !touchedSlugs.has(thing.slug);
	return domain.things.filter(isUntouched).map((thing) => {
		const finding = `No rule governs "${thing.title}", no field refers to it and no task takes it in or produces it. Is it kept, or is it left over?`;
		return candidateOf(domainCheckKind.untouched, finding, [thing]);
	});
}
