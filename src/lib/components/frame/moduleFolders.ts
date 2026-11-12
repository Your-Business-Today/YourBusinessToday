import type { FrameGroupKey, FrameLink } from './frameGroups';
import type { OrganisationModule } from '$lib/data/organisationModules';

/** Where a module's page sits in the side bar, and what it is called inside its folder. */
type ModuleFolder = { group: FrameGroupKey; label: string };

const moduleFolders: Record<OrganisationModule, ModuleFolder> = {
	books: { group: 'accounts', label: 'Reports' },
	sales: { group: 'sales', label: 'Prospecting' },
	business_brain: { group: 'knowledge', label: 'Your Business Brain' },
	brand: { group: 'more', label: 'Brand' },
	boardroom: { group: 'more', label: 'Boardroom' }
};

/** A module's page as the side bar lists it, in its folder. */
export function moduleFrameLink(module: OrganisationModule, href: string): FrameLink {
	const { group, label } = moduleFolders[module];
	return { href, label, group };
}
