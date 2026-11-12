import { describe, expect, it } from 'vitest';
import { describeProductDomainRun } from './describeProductDomainRun';
import { productDomainHolder } from './domainHolder';
import type { ModuleProduct } from '../organisationModuleGate';
import type { OrganisationDomain } from '$lib/data/organisationDomain';
import type { ProductDomainRunStanding } from './productDomainRunStanding';

const product = {
	organisation: { id: 'org-1', parentOrganisationId: null, name: 'Oak & Ash Joinery' },
	project: { id: 'product-1', name: 'Workshop app', repositoryUrl: '' }
} as unknown as ModuleProduct;

const firstRun: ProductDomainRunStanding = {
	holder: productDomainHolder(product),
	organisationName: 'Oak & Ash Joinery',
	domain: null,
	sources: [],
	repositoryUrl: '',
	repositoryDomain: null,
	organisationDomain: null
};

const organisationDomain = {
	model: { contexts: [], relationships: [] },
	contexts: [{ pageId: 'p1', slug: 'joinery', title: 'Joinery', summary: '', isCoreDomain: true, blocks: [] }],
	contextMap: null
} as unknown as OrganisationDomain;

describe('the product domain run', () => {
	it('starts a first run broad, and ends by filing on the person’s yes and giving the product’s Domain tab', () => {
		const walk = describeProductDomainRun(firstRun);
		expect(walk).toContain("Workshop app's own domain: nothing yet. This is the first run");
		expect(walk).toContain('Repository: none recorded');
		expect(walk).toContain('file_product_brain_domain with projectId product-1, one call per source');
		expect(walk).toContain('/projects/product-1/domain');
	});

	it('reads the repository in the old reader’s order, then the designs, documents and stories', () => {
		const walk = describeProductDomainRun(firstRun);
		expect(walk).toContain('the readme, then the docs folder, then the code nearest the root, then the configuration');
		expect(walk).toContain('lockfiles, binaries, minified bundles');
		expect(walk).toContain('docs/05-data-model/entities.json and the migrations');
		expect(walk).toContain('user stories with read_project');
	});

	it('takes the business’s words from the organisation’s domain and builds on what GitHub gave', () => {
		const walk = describeProductDomainRun({
			...firstRun,
			repositoryUrl: 'https://github.com/oak/workshop',
			repositoryDomain: { contexts: [], relationships: [] } as never,
			organisationDomain
		});
		expect(walk).toContain("Oak & Ash Joinery's own domain: 1 contexts");
		expect(walk).toContain('read_business_brain_domain for the business');
		expect(walk).toContain('Repository: https://github.com/oak/workshop. What GitHub gave it holds 0 entities');
	});
});
