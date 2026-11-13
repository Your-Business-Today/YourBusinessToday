import { domainPageKinds, type DomainFieldFact, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { domainEntityKinds, type DomainEntityKind, type ThingGroup } from '$lib/data/blueprint/domainModel';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { EntityManifest, ManifestArea, ManifestEntity, ManifestField, ManifestMark } from '$lib/server/blueprint/entityManifest';

/** The kind each page of a thing is drawn as; a group is drawn round its members rather than as a thing of its own. */
const drawnKinds: Partial<Record<DomainPageKind, DomainEntityKind>> = {
	[domainPageKinds.entity]: domainEntityKinds.record,
	[domainPageKinds.valueObject]: domainEntityKinds.detail,
	[domainPageKinds.domainService]: domainEntityKinds.operation,
	[domainPageKinds.domainEvent]: domainEntityKinds.event
};

/**
 * The domain pages in the entity manifest's shape, so the map a repository's domain is drawn by draws them
 * too: each bounded context an area, each record, detail, operation and event beneath it named by its slug,
 * a record's aggregate root its parent, each group round its members, and each event marking its record.
 */
export function manifestOfDomainPages(contextPages: DomainPage[], pages: DomainPage[]): EntityManifest {
	const thingPages = pages.filter((page) => drawnKinds[page.kind] !== undefined);
	const recordSlugs = new Set(pages.filter((page) => page.kind === domainPageKinds.entity).map((page) => page.slug));
	const areas = contextPages.map((context) => areaOf(context, pages, { thingPages, recordSlugs }));
	const enums = Object.fromEntries(thingPages.map(({ slug, facts }) => [slug, facts.statuses]));
	return { areas, routes: {}, enums };
}

type DrawnPages = { thingPages: DomainPage[]; recordSlugs: Set<string> };

function areaOf(context: DomainPage, pages: DomainPage[], drawn: DrawnPages): ManifestArea {
	const isInside = (page: DomainPage) => page.parentPageId === context.pageId;
	const groups = pages.filter((page) => isInside(page) && page.kind === domainPageKinds.aggregate).map(groupOf);
	const entities = drawn.thingPages.filter(isInside).map((page) => entityOf(page, drawn.recordSlugs));
	return { name: context.slug, title: context.title, entities, groups };
}

function entityOf(page: DomainPage, recordSlugs: Set<string>): ManifestEntity {
	const { slug, kind, title, summary, facts } = page;
	const { aggregateRootSlug: rootSlug, statuses } = facts;
	const isInsideAnother = rootSlug !== null && rootSlug !== slug && recordSlugs.has(rootSlug);
	const entity = {
		name: slug,
		kind: drawnKinds[kind],
		title,
		plural: title,
		parent: isInsideAnother ? rootSlug : null,
		status: statuses.length > 0 ? [slug] : null,
		fields: facts.fields.map(manifestField),
		notes: summary
	};
	const marks = markOf(page);
	return marks === null ? entity : { ...entity, marks };
}

function markOf({ facts }: DomainPage): ManifestMark | null {
	const { marksThingSlug, marksStatus } = facts;
	return marksThingSlug === null ? null : { entityName: marksThingSlug, status: marksStatus };
}

/** A group's members: its root first when it names one, then each member it names, once each. */
function groupOf({ slug, title, facts }: DomainPage): ThingGroup {
	const { aggregateRootSlug, memberSlugs } = facts;
	const root = aggregateRootSlug === null || aggregateRootSlug === slug ? [] : [aggregateRootSlug];
	return { name: slug, title, memberNames: [...new Set([...root, ...memberSlugs])] };
}

function manifestField({ name, label, type, ref, isRequired, notes }: DomainFieldFact): ManifestField {
	return ref === null ? { name, label, type, required: isRequired, notes } : { name, label, type, ref, required: isRequired, notes };
}
