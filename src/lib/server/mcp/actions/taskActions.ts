import { acceptanceCriterionActions } from './acceptanceCriterionActions';
import { buildDispatchActions } from './buildDispatchActions';
import { builderActions } from './builderActions';
import { checklistActions } from './checklistActions';
import { checklistItemActions } from './checklistItemActions';
import { taskOrderActions } from './taskOrderActions';
import { taskParentActions } from './taskParentActions';
import { taskProjectActions } from './taskProjectActions';
import { taskQueueActions } from './taskQueueActions';
import { taskRemovalActions } from './taskRemovalActions';
import { taskRoleActions } from './taskRoleActions';
import { taskAttachmentReadActions } from './taskAttachmentReadActions';
import { taskAttachmentWriteActions } from './taskAttachmentWriteActions';
import { taskReadActions } from './taskReadActions';
import { taskStatusActions } from './taskStatusActions';
import { taskStoryActions } from './taskStoryActions';
import { taskTeamActions } from './taskTeamActions';
import { taskUpdateActions } from './taskUpdateActions';
import { taskWriteActions } from './taskWriteActions';
import type { McpAction } from '../actionTypes';

export const taskActions: McpAction[] = [
	...taskReadActions,
	...taskWriteActions,
	...taskUpdateActions,
	...taskStatusActions,
	...taskStoryActions,
	...taskTeamActions,
	...taskRoleActions,
	...taskOrderActions,
	...taskQueueActions,
	...taskParentActions,
	...taskProjectActions,
	...taskRemovalActions,
	...acceptanceCriterionActions,
	...checklistActions,
	...checklistItemActions,
	...taskAttachmentReadActions,
	...taskAttachmentWriteActions,
	...buildDispatchActions,
	...builderActions
];
