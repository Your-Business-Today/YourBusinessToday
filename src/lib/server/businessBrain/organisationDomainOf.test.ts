import { describe, expect, it } from 'vitest';
import { organisationDomainOf } from './organisationDomainOf';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import { entitiesOf, type DomainModel } from '$lib/data/blueprint/domainModel';
import type { DomainPage, OrganisationDomain } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';

function page(pageId: string, kind: DomainPageKind, parentPageId: string | null, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId, parentPageId, kind, slug: pageId, title: `The ${pageId}`, summary: `About ${pageId}`, facts: readDomainPageFacts(facts) };
}

function filed(pages: DomainPage[]): OrganisationDomain {
	const domain = organisationDomainOf(pages);
	if (domain === null) throw new Error('No domain was drawn.');
	return domain;
}

function modelOf(pages: DomainPage[]): DomainModel {
	const { model } = filed(pages);
	return model;
}

const sales = page('sales', 'bounded_context', null, { isCoreDomain: true });
const delivery = page('delivery', 'bounded_context', null);
const order = page('order', 'entity', 'sales', {
	fields: [{ name: 'customer', type: 'ref', ref: 'customer', isRequired: true }],
	statuses: ['open', 'paid']
});
const orderLine = page('order-line', 'entity', 'sales', { aggregateRootSlug: 'order', fields: [{ name: 'quantity', type: 'number' }] });
const customer = page('customer', 'entity', 'sales');
const price = page('price', 'value_object', 'sales');
const glossary = page('sales-glossary', 'glossary', 'sales');
const contextMap = page('context-map', 'context_map', null);

describe('organisationDomainOf', () => {
	it('has no domain until a bounded context is filed', () => {
		expect(organisationDomainOf([order, customer])).toBeNull();
	});

	it('draws each entity inside its aggregate root, and its references between entities', () => {
		const { contexts, relationships } = modelOf([sales, delivery, order, orderLine, customer]);
		const [salesContext] = contexts;
		const [orderAggregate, customerAggregate] = salesContext.aggregates;
		expect(orderAggregate.entities.map((entity) => entity.name)).toEqual(['order', 'order-line']);
		expect(customerAggregate.rootName).toBe('customer');
		expect(relationships).toContainEqual({ fromEntityName: 'order', toEntityName: 'customer', kind: 'reference', fieldName: 'customer' });
		expect(relationships).toContainEqual({ fromEntityName: 'order-line', toEntityName: 'order', kind: 'containment', fieldName: '' });
	});

	it('keeps an entity’s statuses and fields as its page’s facts give them', () => {
		const [drawnOrder] = entitiesOf(modelOf([sales, order, customer]));
		const [customerField] = drawnOrder.fields;
		expect(drawnOrder.statuses).toEqual(['open', 'paid']);
		expect(customerField).toMatchObject({ name: 'customer', referencedEntityName: 'customer', isRequired: true });
	});

	it('marks the core domain and lists the blocks the map does not draw beneath their context', () => {
		const { contexts, contextMap: drawnContextMap } = filed([sales, delivery, order, price, glossary, contextMap]);
		const [salesSummary] = contexts;
		expect(contexts.map(({ slug, isCoreDomain }) => ({ slug, isCoreDomain }))).toEqual([
			{ slug: 'sales', isCoreDomain: true },
			{ slug: 'delivery', isCoreDomain: false }
		]);
		expect(salesSummary.blocks.map((block) => block.pageId)).toEqual(['price', 'sales-glossary']);
		expect(drawnContextMap?.pageId).toBe('context-map');
	});
});
