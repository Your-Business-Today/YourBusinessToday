import type { Crumb } from '$lib/components/workspace/projectCrumbs';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const organisationsCrumb: Crumb = { label: 'Organisations', href: '/organisations' };

/** The register, then the parent when the page is one of its businesses. */
export function organisationCrumbs(parent: Organisation | null): Crumb[] {
	if (parent === null) return [organisationsCrumb];
	return [organisationsCrumb, { label: parent.name, href: `/organisations/${parent.id}` }];
}
