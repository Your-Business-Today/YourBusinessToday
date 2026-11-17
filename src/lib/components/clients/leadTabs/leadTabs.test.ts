import { describe, expect, it } from 'vitest';
import { leadTabCrumbs, leadTabHref, leadTabKeys, leadTabsFor } from './leadTabs';

const conservaqua = { id: 'conservaqua', name: 'Conservaqua', stage: 'lead' as const };

describe('leadTabs', () => {
	it('keeps every tab under the lead’s own address', () => {
		const hrefs = leadTabsFor(conservaqua).map((tab) => tab.href);
		expect(hrefs).toEqual([
			'/leads/conservaqua',
			'/leads/conservaqua/domain',
			'/leads/conservaqua/workflow-map',
			'/leads/conservaqua/brand-kit',
			'/leads/conservaqua/quote'
		]);
	});

	it('moves the tabs to the Clients register once the company signs', () => {
		const signed = { ...conservaqua, stage: 'client' as const };
		expect(leadTabHref(signed, leadTabKeys.brand)).toBe('/clients/conservaqua/brand-kit');
	});

	it('leads back through the register and the company', () => {
		expect(leadTabCrumbs(conservaqua).map((crumb) => crumb.label)).toEqual(['Leads', 'Conservaqua']);
	});
});
