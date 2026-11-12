import { organisationHref, organisationPages } from '$lib/components/organisations/organisationPages';
import type { FrameGroupKey, FrameLink } from './frameGroups';
import type { OrganisationModule } from '$lib/data/organisationModules';

/** Where a module's page sits in the side bar, and what it is called inside its folder. */
type ModuleFolder = { group: FrameGroupKey; label: string };

/** What the side bar calls the pages that take the same words as their own heading. */
export const framePageLabels = { reports: 'Reports', domain: 'Domain' } as const;

const moduleFolders: Record<OrganisationModule, ModuleFolder> = {
	books: { group: 'accounts', label: framePageLabels.reports },
	sales: { group: 'sales', label: 'Prospecting' },
	business_brain: { group: 'knowledge', label: 'Your Business Brain' },
	brand: { group: 'more', label: 'Brand' },
	boardroom: { group: 'more', label: 'Boardroom' }
};

const domainFolder: ModuleFolder = { group: 'knowledge', label: framePageLabels.domain };
const domainKeeper: OrganisationModule = 'business_brain';

/** A module's page as the side bar lists it, in its folder. */
export function moduleFrameLink(module: OrganisationModule, href: string): FrameLink {
	const { group, label } = moduleFolders[module];
	return { href, label, group };
}

/** The organisation's domain as the side bar lists it: under Knowledge, beside the brain that keeps it. */
export function domainFrameLink(organisationId: string): FrameLink {
	return { href: organisationHref(organisationId, organisationPages.domain), ...domainFolder };
}

/** The domain is kept in Your Business Brain, so its page is listed only where the brain's is. */
export function keepsTheDomain(module: OrganisationModule): boolean {
	return module === domainKeeper;
}
