import { brandPathOf } from './brandKitPageWords';

export const nothingPlanned = 'Nothing planned';

export function contentPlanPathOf(organisationId: string, monthKey?: string): string {
	const path = `${brandPathOf(organisationId)}/plan`;
	if (monthKey === undefined) return path;
	return `${path}?month=${monthKey}`;
}
