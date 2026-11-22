import type { Crumb } from '$lib/components/workspace/projectCrumbs';

export const organisationsCrumb: Crumb = { label: 'Organisations', href: '/organisations' };

/** The trail to one organisation's page, which each of its modules' pages starts from. */
export function organisationCrumbsFor(organisation: { id: string; name: string }): Crumb[] {
	return [organisationsCrumb, { label: organisation.name, href: `/organisations/${organisation.id}` }];
}
