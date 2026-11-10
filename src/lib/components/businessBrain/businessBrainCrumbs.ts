import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';

type CrumbedOrganisation = { id: string; name: string };

/** The way back from Your Business Brain: its organisation. */
export function businessBrainCrumbs(organisation: CrumbedOrganisation): Crumb[] {
	return [{ label: organisation.name, href: `/organisations/${organisation.id}` }];
}

/** The way back from one of its pages: the organisation, then Your Business Brain. */
export function businessBrainPageCrumbs(organisation: CrumbedOrganisation): Crumb[] {
	const home = { label: 'Your Business Brain', href: businessBrainAddresses(organisation.id).home };
	return [...businessBrainCrumbs(organisation), home];
}
