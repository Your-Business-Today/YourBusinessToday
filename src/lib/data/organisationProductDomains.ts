import { entitiesOf, type DomainModel } from './blueprint/domainModel';

/** One entity of a product's domain as the organisation's Domain lists it. */
export type ProductEntity = { name: string; title: string; contextTitle: string; fieldCount: number; href: string };

/** A product's domain as the organisation sees it: its entities, or none when nothing has been read from its repository. */
export type ProductDomain = { projectId: string; productName: string; domainHref: string; entities: ProductEntity[]; isRead: boolean };

type ProductReading = { project: { id: string; name: string }; domain: DomainModel | null };

export function productDomainOf({ project, domain }: ProductReading): ProductDomain {
	const domainHref = `/projects/${project.id}/domain`;
	const base = { projectId: project.id, productName: project.name, domainHref };
	if (domain === null) return { ...base, entities: [], isRead: false };
	return { ...base, entities: productEntitiesOf(domain, domainHref), isRead: true };
}

function productEntitiesOf(domain: DomainModel, domainHref: string): ProductEntity[] {
	const contextTitles = new Map(domain.contexts.map((context) => [context.name, context.title]));
	return entitiesOf(domain).map(({ name, title, contextName, fields }) => ({
		name,
		title,
		contextTitle: contextTitles.get(contextName) ?? contextName,
		fieldCount: fields.length,
		href: `${domainHref}?entity=${encodeURIComponent(name)}`
	}));
}
