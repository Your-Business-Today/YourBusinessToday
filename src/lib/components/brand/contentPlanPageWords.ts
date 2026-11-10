import { brandPathOf } from './brandKitPageWords';

export const nothingPlanned = 'Nothing planned';

export const noKindsThisMonth = 'Nothing is planned this month, so there is no mix of kinds yet.';

export function contentPlanPathOf(organisationId: string, monthKey?: string): string {
	const path = `${brandPathOf(organisationId)}/plan`;
	if (monthKey === undefined) return path;
	return `${path}?month=${monthKey}`;
}
