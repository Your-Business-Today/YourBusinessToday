import { companyPagePath, registerOfStage } from '$lib/data/salesRegisters';
import type { ClientStage } from '$lib/data/clientLifecycle';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

/**
 * The tabs of a company's own page, "Their business". Overview holds our sales notes; every other tab shows only
 * what has been built for the company, so it can be shown to them on a screen.
 */
export const leadTabKeys = { overview: 'overview', domain: 'domain', workflowMap: 'workflow-map', brand: 'brand', quote: 'quote' } as const;

export type LeadTabKey = (typeof leadTabKeys)[keyof typeof leadTabKeys];

export type LeadCompany = { id: string; name: string; stage: ClientStage };

export const leadTabLabels: Record<LeadTabKey, string> = {
	overview: 'Overview',
	domain: 'Domain',
	'workflow-map': 'Workflow map',
	brand: 'Brand',
	quote: 'Quote'
};

/** Overview at the company's own address, each other tab beneath it, so the organisation picker never moves. */
export function leadTabHref(company: LeadCompany, tabKey: LeadTabKey): string {
	const overviewHref = companyPagePath(company);
	if (tabKey === leadTabKeys.overview) return overviewHref;
	return `${overviewHref}/${tabKey}`;
}

export function leadTabsFor(company: LeadCompany): Tab[] {
	const everyTabKey: LeadTabKey[] = Object.values(leadTabKeys);
	return everyTabKey.map((key) => ({ key, label: leadTabLabels[key], count: null, href: leadTabHref(company, key) }));
}

/** The way back from a tab: the register, then the company. */
export function leadTabCrumbs(company: LeadCompany): Crumb[] {
	const register = registerOfStage(company.stage);
	return [
		{ label: register.title, href: register.path },
		{ label: company.name, href: companyPagePath(company) }
	];
}
