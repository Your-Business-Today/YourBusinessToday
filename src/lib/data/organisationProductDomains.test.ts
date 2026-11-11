import { describe, expect, it } from 'vitest';
import { productDomainOf } from './organisationProductDomains';
import type { DomainModel } from './blueprint/domainModel';

const project = { id: 'harbour', name: 'Harbour site' };

const invoice = {
	name: 'Invoice',
	title: 'Invoice',
	plural: 'Invoices',
	contextName: 'billing',
	aggregateRootName: 'Invoice',
	route: null,
	statuses: [],
	fields: [{ name: 'total', label: 'Total', type: 'money', referencedEntityName: null, isRequired: true, notes: '' }],
	notes: ''
};

const domain: DomainModel = {
	contexts: [{ name: 'billing', title: 'Billing', aggregates: [{ rootName: 'Invoice', entities: [invoice] }] }],
	relationships: []
};

describe('productDomainOf', () => {
	it('lists each entity with its context and how many fields it has, opening it on the product’s Domain', () => {
		const productDomain = productDomainOf({ project, domain });
		expect(productDomain.entities).toEqual([
			{ name: 'Invoice', title: 'Invoice', contextTitle: 'Billing', fieldCount: 1, href: '/projects/harbour/domain?entity=Invoice' }
		]);
	});

	it('says when nothing has been read from the product’s repository yet', () => {
		expect(productDomainOf({ project, domain: null }).isRead).toBe(false);
	});
});
