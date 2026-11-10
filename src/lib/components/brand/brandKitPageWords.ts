import { organisationsCrumb } from '$lib/components/organisations/organisationCrumbs';
import { starterPostKinds } from '$lib/brand/postKinds/postKinds';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';

export const nothingDecidedYet = 'Nothing decided in the kit yet.';

export const starterKindsOffered =
	`None kept yet. Until the brand keeps its own, your Claude plans each post as one of the starter list: ` +
	`${starterPostKinds.join(', ')}.`;

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
