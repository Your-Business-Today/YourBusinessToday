import { portalBillingActions } from './portalBillingActions';
import { portalContextActions } from './portalContextActions';
import { portalPeopleActions } from './portalPeopleActions';
import { portalRequestReadActions } from './portalRequestReadActions';
import { portalRequestWriteActions } from './portalRequestWriteActions';
import type { McpAction } from '../actionTypes';

/** What a client contact reaches through the connector: the same as their portal. */
export const portalActions: McpAction[] = [
	...portalRequestReadActions,
	...portalRequestWriteActions,
	...portalContextActions,
	...portalPeopleActions,
	...portalBillingActions
];
