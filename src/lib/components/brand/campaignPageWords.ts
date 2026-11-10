import { brandKitCrumbsFor } from './brandKitPageWords';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';

export const noAudienceYet = 'No breakdown of who it reached has been recorded yet. Your Claude records one from the platform’s report.';

export function campaignCrumbsFor(organisation: { id: string; name: string }): Crumb[] {
	return [...brandKitCrumbsFor(organisation), { label: 'Brand kit', href: `/organisations/${organisation.id}/brand` }];
}
