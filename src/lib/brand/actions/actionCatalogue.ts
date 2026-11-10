import { audienceActions } from './audienceActions';
import { brandActions } from './brandActions';
import type { BrandAction } from './brandAction';

export const everyAction: BrandAction[] = [...brandActions, ...audienceActions];

export function findBrandAction(key: string): BrandAction | null {
	return everyAction.find((action) => action.key === key) ?? null;
}

export function isAudienceActionKey(key: string): boolean {
	return audienceActions.some((action) => action.key === key);
}
