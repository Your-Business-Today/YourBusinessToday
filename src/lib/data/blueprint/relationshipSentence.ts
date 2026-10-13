import { relationshipKinds, type DomainRelationship } from './domainModel';

export type RelationshipSentence = { before: string; otherEntityName: string; after: string };

/** A relationship read from one end of it, as a sentence around the entity at the other end. */
export function relationshipSentence(relationship: DomainRelationship, entityName: string): RelationshipSentence {
	const isOutgoing = relationship.fromEntityName === entityName;
	const isContainment = relationship.kind === relationshipKinds.containment;
	const through = relationship.fieldName === '' ? '' : ` by ${relationship.fieldName}`;
	if (isOutgoing) {
		const otherEntityName = relationship.toEntityName;
		return { before: isContainment ? 'Lives inside' : 'Refers to', otherEntityName, after: through };
	}
	const otherEntityName = relationship.fromEntityName;
	return { before: isContainment ? 'Holds' : 'Referred to by', otherEntityName, after: through };
}
