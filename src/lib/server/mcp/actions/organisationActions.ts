import { boardroomActions } from './boardroomActions';
import { confirmedWorkflowMapActions } from './confirmedWorkflowMapActions';
import { organisationInviteActions } from './organisationInviteActions';
import { organisationModuleActions } from './organisationModuleActions';
import { organisationPeopleActions } from './organisationPeopleActions';
import { organisationProjectActions } from './organisationProjectActions';
import { organisationReadActions } from './organisationReadActions';
import { organisationWriteActions } from './organisationWriteActions';
import { teamWorkActions } from './teamWorkActions';
import { workflowMapActions } from './workflowMapActions';
import { workflowMapRunActions } from './workflowMapRunActions';
import type { McpAction } from '../actionTypes';

export const organisationActions: McpAction[] = [
	...organisationReadActions,
	...organisationWriteActions,
	...organisationInviteActions,
	...organisationModuleActions,
	...boardroomActions,
	...organisationPeopleActions,
	...organisationProjectActions,
	...teamWorkActions,
	...workflowMapActions,
	...confirmedWorkflowMapActions,
	...workflowMapRunActions
];
