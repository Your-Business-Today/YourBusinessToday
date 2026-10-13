/**
 * A project's business domain in domain-driven design form, read from its repository: bounded contexts, each
 * holding its entities grouped into aggregates, and the relationships drawn between entities by their references.
 */
export type DomainModel = {
	contexts: BoundedContext[];
	relationships: DomainRelationship[];
};

export type BoundedContext = {
	name: string;
	title: string;
	aggregates: Aggregate[];
};

/** An aggregate root and the entities that live inside it, the root first. */
export type Aggregate = {
	rootName: string;
	entities: DomainEntity[];
};

export type DomainEntity = {
	name: string;
	title: string;
	plural: string;
	contextName: string;
	aggregateRootName: string;
	route: string | null;
	statuses: string[];
	fields: DomainField[];
	notes: string;
};

export type DomainField = {
	name: string;
	label: string;
	type: string;
	referencedEntityName: string | null;
	isRequired: boolean;
	notes: string;
};

export const relationshipKinds = { containment: 'containment', reference: 'reference' } as const;

export type RelationshipKind = (typeof relationshipKinds)[keyof typeof relationshipKinds];

/** One entity pointing at another: a child held inside its parent, or a field referring to another entity. */
export type DomainRelationship = {
	fromEntityName: string;
	toEntityName: string;
	kind: RelationshipKind;
	fieldName: string;
};

export function entitiesOf(domain: DomainModel): DomainEntity[] {
	return domain.contexts.flatMap((context) => context.aggregates.flatMap((aggregate) => aggregate.entities));
}

export function entitiesInContext(context: BoundedContext): DomainEntity[] {
	return context.aggregates.flatMap((aggregate) => aggregate.entities);
}

/** A key that tells one relationship from another, even two between the same entities. */
export function relationshipKey(relationship: DomainRelationship): string {
	return `${relationship.fromEntityName}-${relationship.fieldName}-${relationship.toEntityName}`;
}

/** The names of the entities on the other end of every relationship that touches this one. */
export function relatedEntityNames(domain: DomainModel, entityName: string): Set<string> {
	const touching = relationshipsTouching(domain, entityName);
	return new Set(touching.flatMap((relationship) => [relationship.fromEntityName, relationship.toEntityName]));
}

export function relationshipsTouching(domain: DomainModel, entityName: string): DomainRelationship[] {
	return domain.relationships.filter(
		(relationship) => relationship.fromEntityName === entityName || relationship.toEntityName === entityName
	);
}
