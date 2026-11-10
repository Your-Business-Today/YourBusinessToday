import { boardroomPathOf } from '$lib/data/boardroomPaths';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';

type CrumbOrganisation = { id: string; name: string };

export function organisationCrumbOf(organisation: CrumbOrganisation): Crumb {
	return { label: organisation.name, href: `/organisations/${organisation.id}` };
}

export function boardroomCrumbsOf(organisation: CrumbOrganisation): Crumb[] {
	return [organisationCrumbOf(organisation), { label: 'Boardroom', href: boardroomPathOf(organisation.id) }];
}
