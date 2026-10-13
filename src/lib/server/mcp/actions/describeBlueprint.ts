import { entitiesOf, type BoundedContext, type DomainEntity, type DomainModel } from '$lib/data/blueprint/domainModel';
import { screenAtRoute, screenCountOf, type Screen, type SiteMap } from '$lib/data/blueprint/siteMap';

/** The domain as Markdown: each context, its aggregates, and every entity with its fields and references. */
export function describeDomain(domain: DomainModel, projectName: string): string {
	const { contexts, relationships } = domain;
	const counts = `${contexts.length} contexts, ${entitiesOf(domain).length} entities, ${relationships.length} relationships`;
	return [`${projectName} domain: ${counts}.`, ...contexts.map(describeContext)].join('\n\n');
}

function describeContext(context: BoundedContext): string {
	const aggregates = context.aggregates.map(
		(aggregate) => `Aggregate ${aggregate.rootName}:\n${aggregate.entities.map(describeEntity).join('\n')}`
	);
	return [`## ${context.title}`, ...aggregates].join('\n');
}

function describeEntity(entity: DomainEntity): string {
	const fields = entity.fields.map((field) =>
		field.referencedEntityName === null ? field.name : `${field.name} → ${field.referencedEntityName}`
	);
	const { statuses } = entity;
	const statusLine = statuses.length === 0 ? '' : ` Statuses: ${statuses.join(', ')}.`;
	const route = entity.route === null ? '' : ` Pages at ${entity.route}.`;
	return `- ${entity.title} (${entity.name}): ${fields.join(', ')}.${statusLine}${route}`;
}

/** The site map as Markdown: every screen by route with its view, or one screen with what a user sees there. */
export function describeSiteMap(siteMap: SiteMap, projectName: string, route: string | null): string {
	if (route === null) return describeEveryScreen(siteMap, projectName);
	const screen = screenAtRoute(siteMap, route);
	return describeScreen(screen, route);
}

function describeEveryScreen(siteMap: SiteMap, projectName: string): string {
	const lines = siteMap.screens.map(screenLine);
	const screenCount = screenCountOf(siteMap);
	return [`${projectName} site map: ${screenCount} screens. Give a route to see what a user sees there.`, ...lines].join('\n');
}

function screenLine(screen: Screen): string {
	const entity = screen.entityName === null ? '' : ` (${screen.entityName})`;
	return `- ${screen.route}${entity}: ${screen.viewFile}`;
}

function describeScreen(screen: Screen | undefined, route: string): string {
	if (screen === undefined) return `No screen at ${route}. Call read_project_site_map without a route for every screen.`;
	return [`${screen.route}, drawn by ${screen.viewFile}.`, 'What a user sees, in the kit\'s widget notation:', screen.layout].join('\n');
}
