import { organisationsCrumb } from '$lib/components/organisations/organisationCrumbs';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';

export const nothingDecidedYet = 'Nothing decided in the kit yet.';

export function brandKitCrumbsFor(organisation: { id: string; name: string }): Crumb[] {
	return [organisationsCrumb, { label: organisation.name, href: `/organisations/${organisation.id}` }];
}

export function brandCrumbsFor(organisation: { id: string; name: string }): Crumb[] {
	return [...brandKitCrumbsFor(organisation), { label: 'Brand', href: brandPathOf(organisation.id) }];
}

export function brandPathOf(organisationId: string): string {
	return `/organisations/${organisationId}/brand`;
}

export function contentPiecePathOf(organisationId: string, contentPieceId: string): string {
	return `${brandPathOf(organisationId)}/content/${contentPieceId}`;
}
