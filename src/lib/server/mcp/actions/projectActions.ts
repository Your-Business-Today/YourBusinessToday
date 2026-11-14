import { blueprintRefreshActions } from './blueprintRefreshActions';
import { deployActions } from './deployActions';
import { deployHistoryActions } from './deployHistoryActions';
import { feedActions } from './feedActions';
import { kitVersionActions } from './kitVersionActions';
import { projectBlueprintActions } from './projectBlueprintActions';
import { projectCreateActions } from './projectCreateActions';
import { projectJourneyMapActions } from './projectJourneyMapActions';
import { projectOrderActions } from './projectOrderActions';
import { projectOwnershipActions } from './projectOwnershipActions';
import { projectReadActions } from './projectReadActions';
import { projectRemovalActions } from './projectRemovalActions';
import { projectWriteActions } from './projectWriteActions';
import { siteMapRunActions } from './siteMapRunActions';
import type { McpAction } from '../actionTypes';

export const projectActions: McpAction[] = [
	...projectReadActions,
	...projectBlueprintActions,
	...projectJourneyMapActions,
	...siteMapRunActions,
	...blueprintRefreshActions,
	...kitVersionActions,
	...feedActions,
	...projectCreateActions,
	...projectWriteActions,
	...deployActions,
	...deployHistoryActions,
	...projectRemovalActions,
	...projectOrderActions,
	...projectOwnershipActions
];
