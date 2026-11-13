import { boardroomActions } from './boardroomActions';
import { companyContextActions } from './companyContextActions';
import { confirmedContextActions } from './confirmedContextActions';
import { contextRunActions } from './contextRunActions';
import { organisationInviteActions } from './organisationInviteActions';
import { organisationModuleActions } from './organisationModuleActions';
import { organisationPeopleActions } from './organisationPeopleActions';
import { organisationProjectActions } from './organisationProjectActions';
import { organisationReadActions } from './organisationReadActions';
import { organisationWriteActions } from './organisationWriteActions';
import { teamWorkActions } from './teamWorkActions';
import { workflowMapActions } from './workflowMapActions';
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
	...companyContextActions,
	...confirmedContextActions,
	...contextRunActions,
	...workflowMapActions
];
