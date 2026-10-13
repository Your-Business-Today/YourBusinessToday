import { relationshipKinds, type Aggregate, type BoundedContext, type DomainEntity, type DomainField, type DomainModel, type DomainRelationship } from '$lib/data/blueprint/domainModel';
import type { EntityManifest, ManifestArea, ManifestEntity, ManifestField } from './entityManifest';

const referenceFieldType = 'ref';

/** The manifest's areas become bounded contexts, its parents aggregates, and its parents and references relationships. */
export function translateEntityManifest(manifest: EntityManifest): DomainModel {
	const parents = new Map(everyEntity(manifest).map((entity) => [entity.name, entity.parent]));
	const contexts = manifest.areas.map((area) => boundedContext(area, manifest, parents));
	return { contexts, relationships: everyEntity(manifest).flatMap(relationshipsOf) };
}

function everyEntity(manifest: EntityManifest): ManifestEntity[] {
	return manifest.areas.flatMap((area) => area.entities);
}

function boundedContext(area: ManifestArea, manifest: EntityManifest, parents: Map<string, string | null>): BoundedContext {
	const entities = area.entities.map((entity) => domainEntity(entity, area, manifest, parents));
	const rootNames = [...new Set(entities.map((entity) => entity.aggregateRootName))];
	const aggregates = rootNames.map((rootName) => aggregate(rootName, entities));
	return { name: area.name, title: area.title ?? area.name, aggregates };
}

function aggregate(rootName: string, entities: DomainEntity[]): Aggregate {
	const members = entities.filter((entity) => entity.aggregateRootName === rootName);
	const root = members.filter((entity) => entity.name === rootName);
	const inside = members.filter((entity) => entity.name !== rootName);
	return { rootName, entities: [...root, ...inside] };
}

/** The top of an entity's chain of parents; a guard stops a manifest whose parents loop. */
export function aggregateRootOf(entityName: string, parents: Map<string, string | null>): string {
	let rootName = entityName;
	const seen = new Set<string>();
	while (parents.get(rootName) && !seen.has(rootName)) {
		seen.add(rootName);
		rootName = parents.get(rootName) as string;
	}
	return rootName;
}

function domainEntity(entity: ManifestEntity, area: ManifestArea, manifest: EntityManifest, parents: Map<string, string | null>): DomainEntity {
	const statusEnumName = entity.status?.[0] ?? '';
	return {
		name: entity.name,
		title: entity.title ?? entity.name,
		plural: entity.plural ?? entity.name,
		contextName: area.name,
		aggregateRootName: aggregateRootOf(entity.name, parents),
		route: manifest.routes[entity.name] ?? null,
		statuses: manifest.enums[statusEnumName] ?? [],
		fields: entity.fields.map(domainField),
		notes: entity.notes ?? ''
	};
}

function domainField(field: ManifestField): DomainField {
	return {
		name: field.name,
		label: field.label ?? field.name,
		type: field.type,
		referencedEntityName: field.type === referenceFieldType ? (field.ref ?? null) : null,
		isRequired: field.required === true,
		notes: field.notes ?? ''
	};
}

function relationshipsOf(entity: ManifestEntity): DomainRelationship[] {
	const references = entity.fields.filter((field) => field.type === referenceFieldType && field.ref);
	const relationships = references.map((field) => relationshipOfField(entity, field));
	const isParentReferenced = references.some((field) => field.ref === entity.parent);
	if (entity.parent === null || isParentReferenced) return relationships;
	return [...relationships, { fromEntityName: entity.name, toEntityName: entity.parent, kind: relationshipKinds.containment, fieldName: '' }];
}

function relationshipOfField(entity: ManifestEntity, field: ManifestField): DomainRelationship {
	const isParent = field.ref === entity.parent;
	return {
		fromEntityName: entity.name,
		toEntityName: field.ref as string,
		kind: isParent ? relationshipKinds.containment : relationshipKinds.reference,
		fieldName: field.name
	};
}
