import { domainPageKinds, type DomainFieldFact } from '$lib/data/businessBrainDomain';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { EntityManifest, ManifestArea, ManifestEntity, ManifestField } from '$lib/server/blueprint/entityManifest';

/**
 * The domain pages in the entity manifest's shape, so the map a repository's domain is drawn by draws them
 * too: each bounded context an area, each entity beneath it an entity named by its slug, and an entity's
 * aggregate root its parent.
 */
export function manifestOfDomainPages(contextPages: DomainPage[], pages: DomainPage[]): EntityManifest {
	const entityPages = pages.filter((page) => page.kind === domainPageKinds.entity);
	const entitySlugs = new Set(entityPages.map((page) => page.slug));
	const areas = contextPages.map((context) => areaOf(context, entityPages, entitySlugs));
	const enums = Object.fromEntries(entityPages.map(({ slug, facts }) => [slug, facts.statuses]));
	return { areas, routes: {}, enums };
}

function areaOf(context: DomainPage, entityPages: DomainPage[], entitySlugs: Set<string>): ManifestArea {
	const inside = entityPages.filter((page) => page.parentPageId === context.pageId);
	return { name: context.slug, title: context.title, entities: inside.map((page) => entityOf(page, entitySlugs)) };
}

function entityOf(page: DomainPage, entitySlugs: Set<string>): ManifestEntity {
	const { slug, title, summary, facts } = page;
	const { aggregateRootSlug: rootSlug, statuses } = facts;
	const isInsideAnother = rootSlug !== null && rootSlug !== slug && entitySlugs.has(rootSlug);
	return {
		name: slug,
		title,
		plural: title,
		parent: isInsideAnother ? rootSlug : null,
		status: statuses.length > 0 ? [slug] : null,
		fields: facts.fields.map(manifestField),
		notes: summary
	};
}

function manifestField({ name, label, type, ref, isRequired, notes }: DomainFieldFact): ManifestField {
	return ref === null ? { name, label, type, required: isRequired, notes } : { name, label, type, ref, required: isRequired, notes };
}
