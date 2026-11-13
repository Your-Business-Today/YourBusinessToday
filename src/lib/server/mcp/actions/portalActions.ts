import { portalBillingActions } from './portalBillingActions';
import { portalContextActions } from './portalContextActions';
import { portalPeopleActions } from './portalPeopleActions';
import { portalRequestReadActions } from './portalRequestReadActions';
import { portalRequestWriteActions } from './portalRequestWriteActions';
import { portalWorkflowMapActions } from './portalWorkflowMapActions';
import type { McpAction } from '../actionTypes';

/** What a client contact reaches through the connector: the same as their portal. */
export const portalActions: McpAction[] = [
	...portalRequestReadActions,
	...portalRequestWriteActions,
	...portalContextActions,
	...portalWorkflowMapActions,
	...portalPeopleActions,
	...portalBillingActions
];
