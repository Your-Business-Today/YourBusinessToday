import { organisationsCrumb } from '$lib/components/organisations/organisationCrumbs';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';

export const nothingDecidedYet = 'Nothing decided in the kit yet.';

export function brandKitCrumbsFor(organisation: { id: string; name: string }): Crumb[] {
	return [organisationsCrumb, { label: organisation.name, href: `/organisations/${organisation.id}` }];
}
