import { autocompleteActions } from './autocompleteActions';
import { buildableActions } from './buildableActions';
import { acceptanceCriterionActions } from './acceptanceCriterionActions';
import { checklistActions } from './checklistActions';
import { checklistItemActions } from './checklistItemActions';
import { taskBranchActions } from './taskBranchActions';
import { taskOrderActions } from './taskOrderActions';
import { priorityMarkActions } from './priorityMarkActions';
import { taskParentActions } from './taskParentActions';
import { taskProjectActions } from './taskProjectActions';
import { taskQueueActions } from './taskQueueActions';
import { taskRemovalActions } from './taskRemovalActions';
import { taskDeletionActions } from './taskDeletionActions';
import { taskPutBackActions } from './taskPutBackActions';
import { taskRoleActions } from './taskRoleActions';
import { complexityActions } from './complexityActions';
import { taskSequenceActions } from './taskSequenceActions';
import { lifecycleActions } from './lifecycleActions';
import { localBuildActions } from './localBuildActions';
import { buildModelAdminActions } from './buildModelAdminActions';
import { modelSettingsActions } from './modelSettingsActions';
import { saveBuildModelAction } from './saveBuildModelAction';
import { taskAttachmentReadActions } from './taskAttachmentReadActions';
import { taskAttachmentWriteActions } from './taskAttachmentWriteActions';
import { taskReadActions } from './taskReadActions';
import { openWorkActions } from './openWorkActions';
import { taskStatusActions } from './taskStatusActions';
import { taskStoryActions } from './taskStoryActions';
import { taskTeamActions } from './taskTeamActions';
import { taskUploadActions } from './taskUploadActions';
import { taskUpdateActions } from './taskUpdateActions';
import { taskWriteActions } from './taskWriteActions';
import { emailPathwayActions } from './emailPathwayActions';
import { similarTaskActions } from './similarTaskActions';
import { designReviewActions } from './designReviewActions';
import type { McpAction } from '../actionTypes';

export const taskActions: McpAction[] = [
	...taskReadActions,
	...openWorkActions,
	...taskWriteActions,
	...designReviewActions,
	...emailPathwayActions,
	...similarTaskActions,
	...taskUpdateActions,
	...taskStatusActions,
	...taskBranchActions,
	...autocompleteActions,
	...taskStoryActions,
	...taskTeamActions,
	...taskRoleActions,
	...complexityActions,
	...taskSequenceActions,
	...lifecycleActions,
	...modelSettingsActions,
	saveBuildModelAction,
	...buildModelAdminActions,
	...buildableActions,
	...localBuildActions,
	...taskOrderActions,
	...priorityMarkActions,
	...taskQueueActions,
	...taskParentActions,
	...taskProjectActions,
	...taskRemovalActions,
	...taskDeletionActions,
	...taskPutBackActions,
	...acceptanceCriterionActions,
	...checklistActions,
	...checklistItemActions,
	...taskAttachmentReadActions,
	...taskAttachmentWriteActions,
	...taskUploadActions
];
