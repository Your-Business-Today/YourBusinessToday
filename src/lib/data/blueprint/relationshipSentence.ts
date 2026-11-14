import { relationshipKinds, type DomainRelationship, type RelationshipKind } from './domainModel';

export type RelationshipSentence = { before: string; otherEntityName: string; after: string };

type SentenceWords = { outgoing: string; incoming: string; through: string };

/** How each kind of relationship reads from either end, and the word that names what it runs through. */
const sentenceWords: Record<RelationshipKind, SentenceWords> = {
	[relationshipKinds.containment]: { outgoing: 'Lives inside', incoming: 'Holds', through: 'by' },
	[relationshipKinds.reference]: { outgoing: 'Refers to', incoming: 'Referred to by', through: 'by' },
	[relationshipKinds.marks]: { outgoing: 'Marks', incoming: 'Marked by', through: 'as it reaches' }
};

/** A relationship read from one end of it, as a sentence around the entity at the other end. */
export function relationshipSentence(relationship: DomainRelationship, entityName: string): RelationshipSentence {
	const words = sentenceWords[relationship.kind];
	const through = relationship.fieldName === '' ? '' : ` ${words.through} ${relationship.fieldName}`;
	const isOutgoing = relationship.fromEntityName === entityName;
	if (isOutgoing) return { before: words.outgoing, otherEntityName: relationship.toEntityName, after: through };
	return { before: words.incoming, otherEntityName: relationship.fromEntityName, after: through };
}
