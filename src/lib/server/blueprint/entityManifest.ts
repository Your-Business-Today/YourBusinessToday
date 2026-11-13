/**
 * The entity manifest the portal-from-folders method writes (docs/05-data-model/entities.json): areas of
 * entities, each with its parent, its status enum and its fields, beside the route each entity's pages live at.
 */
import { parsedJsonOrNull } from '$lib/data/jsonText';
import type { DomainEntityKind, ThingGroup } from '$lib/data/blueprint/domainModel';

export type ManifestField = {
	name: string;
	label?: string;
	type: string;
	ref?: string;
	required?: boolean;
	notes?: string;
};

export type ManifestEntity = {
	name: string;
	title: string;
	plural: string;
	parent: string | null;
	status: string[] | null;
	fields: ManifestField[];
	notes?: string;
	kind?: DomainEntityKind;
	marks?: ManifestMark;
};

/** The record an event marks, by its name, and the status it marks it reaching when one is said. */
export type ManifestMark = { entityName: string; status: string | null };

export type ManifestArea = { name: string; title: string; entities: ManifestEntity[]; groups?: ThingGroup[] };

export type EntityManifest = {
	areas: ManifestArea[];
	routes: Record<string, string>;
	enums: Record<string, string[]>;
};

type Shape = Record<string, unknown>;

/** The manifest when the text is one, or null for anything else. */
export function readEntityManifest(text: string): EntityManifest | null {
	const parsed = parsedJsonOrNull(text);
	if (!isShape(parsed) || !Array.isArray(parsed.areas)) return null;
	const areas = parsed.areas.filter(isArea);
	if (areas.length === 0) return null;
	return { areas, routes: textRecord(parsed.routes), enums: listRecord(parsed.enums) };
}

function isShape(value: unknown): value is Shape {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArea(value: unknown): value is ManifestArea {
	if (!isShape(value) || typeof value.name !== 'string') return false;
	return Array.isArray(value.entities) && value.entities.every(isEntity);
}

function isEntity(value: unknown): value is ManifestEntity {
	if (!isShape(value) || typeof value.name !== 'string') return false;
	return Array.isArray(value.fields);
}

function textRecord(value: unknown): Record<string, string> {
	if (!isShape(value)) return {};
	const entries = Object.entries(value).filter(([, text]) => typeof text === 'string');
	return Object.fromEntries(entries) as Record<string, string>;
}

function listRecord(value: unknown): Record<string, string[]> {
	if (!isShape(value)) return {};
	const entries = Object.entries(value).filter(([, list]) => Array.isArray(list));
	return Object.fromEntries(entries) as Record<string, string[]>;
}
