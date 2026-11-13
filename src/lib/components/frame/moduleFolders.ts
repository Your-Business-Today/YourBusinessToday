import { organisationHref, organisationPages } from '$lib/components/organisations/organisationPages';
import type { FrameGroupKey, FrameLink } from './frameGroups';
import type { LineIconKind } from '$lib/components/site/lineIcons';
import type { OrganisationModule } from '$lib/data/organisationModules';

/** Where a module's page sits in the side bar, what it is called inside its folder, and the icon it is drawn with. */
type ModuleFolder = { group: FrameGroupKey; label: string; icon: LineIconKind };

/** What the side bar calls the pages that take the same words as their own heading. */
export const framePageLabels = { reports: 'Reports', invoices: 'Invoices', costs: 'Costs', domain: 'Domain', workflowMap: 'Workflow map' } as const;

const moduleFolders: Record<OrganisationModule, ModuleFolder> = {
	books: { group: 'accounts', label: framePageLabels.reports, icon: 'chartColumn' },
	sales: { group: 'sales', label: 'Prospecting', icon: 'compass' },
	business_brain: { group: 'knowledge', label: 'Your Business Brain', icon: 'brain' },
	brand: { group: 'more', label: 'Brand', icon: 'swatchBook' },
	boardroom: { group: 'more', label: 'Boardroom', icon: 'presentation' }
};

/** A page a module keeps beneath its own, listed after it in the same folder. */
type ModuleSubpage = { segment: string; label: string; icon: LineIconKind };

const moduleSubpages: Partial<Record<OrganisationModule, ModuleSubpage[]>> = {
	books: [
		{ segment: 'invoices', label: framePageLabels.invoices, icon: 'fileText' },
		{ segment: 'costs', label: framePageLabels.costs, icon: 'receipt' }
	]
};

const domainFolder: ModuleFolder = { group: 'knowledge', label: framePageLabels.domain, icon: 'network' };
const workflowMapFolder: ModuleFolder = { group: 'knowledge', label: framePageLabels.workflowMap, icon: 'route' };
const domainKeeper: OrganisationModule = 'business_brain';

/** A module's page as the side bar lists it, in its folder. */
export function moduleFrameLink(module: OrganisationModule, href: string): FrameLink {
	return { href, ...moduleFolders[module] };
}

/** A module's page and the pages it keeps beneath it, as the side bar lists them, in its folder. */
export function moduleFrameLinks(module: OrganisationModule, href: string): FrameLink[] {
	const { group } = moduleFolders[module];
	const subpages = moduleSubpages[module] ?? [];
	const subpageLinks = subpages.map(({ segment, label, icon }) => ({ href: `${href}/${segment}`, label, icon, group }));
	return [moduleFrameLink(module, href), ...subpageLinks];
}

/** The organisation's domain as the side bar lists it: under Knowledge, beside the brain that keeps it. */
export function domainFrameLink(organisationId: string): FrameLink {
	return { href: organisationHref(organisationId, organisationPages.domain), ...domainFolder };
}

/** The organisation's workflow map as the side bar lists it: under Knowledge, after its domain. */
export function workflowMapFrameLink(organisationId: string): FrameLink {
	return { href: organisationHref(organisationId, organisationPages.workflowMap), ...workflowMapFolder };
}

/** The domain is kept in Your Business Brain, so its page and the workflow map's are listed only where the brain's is. */
export function keepsTheDomain(module: OrganisationModule): boolean {
	return module === domainKeeper;
}
