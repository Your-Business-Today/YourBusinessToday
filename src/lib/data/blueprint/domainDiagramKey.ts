import { domainEntityKinds, everyDomainEntityKind, relationshipKinds, type DomainEntityKind, type RelationshipKind } from './domainModel';

/** Each kind of thing in the site's plain words. */
export const domainEntityKindNames: Record<DomainEntityKind, string> = {
	[domainEntityKinds.record]: 'Record',
	[domainEntityKinds.detail]: 'Detail',
	[domainEntityKinds.operation]: 'Operation',
	[domainEntityKinds.event]: 'Event'
};

/** Each kind of thing as a sentence names it after its area: "In Sales · an operation". */
export const domainEntityKindPhrases: Record<DomainEntityKind, string> = {
	[domainEntityKinds.record]: 'a record',
	[domainEntityKinds.detail]: 'a detail',
	[domainEntityKinds.operation]: 'an operation',
	[domainEntityKinds.event]: 'an event'
};

/** Each kind of line, named for what it says of the thing it starts from. */
const relationshipNames: Record<RelationshipKind, string> = {
	[relationshipKinds.containment]: 'Kept as part of',
	[relationshipKinds.reference]: 'Refers to',
	[relationshipKinds.marks]: 'Marks'
};

export const groupKeyName = 'Group';

export type ThingKeyItem = { kind: DomainEntityKind; name: string };

export type LineKeyItem = { kind: RelationshipKind; name: string };

/** The key's things in the order an area lists them. */
export const thingKeyItems: ThingKeyItem[] = everyDomainEntityKind.map((kind) => ({ kind, name: domainEntityKindNames[kind] }));

export const lineKeyItems: LineKeyItem[] = Object.values(relationshipKinds).map((kind) => ({ kind, name: relationshipNames[kind] }));
