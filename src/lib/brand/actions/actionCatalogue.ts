import { audienceActions } from './audienceActions';
import { brandActions } from './brandActions';
import type { BrandAction } from './brandAction';

export const everyAction: BrandAction[] = [...brandActions, ...audienceActions];
