import { boardroomDirectorActions } from './boardroomDirectorActions';
import { boardroomMeetingActions } from './boardroomMeetingActions';
import { companyContextActions } from './companyContextActions';
import { contextRunActions } from './contextRunActions';
import { organisationInviteActions } from './organisationInviteActions';
import { organisationModuleActions } from './organisationModuleActions';
import { organisationPeopleActions } from './organisationPeopleActions';
import { organisationProjectActions } from './organisationProjectActions';
import { organisationReadActions } from './organisationReadActions';
import { organisationWriteActions } from './organisationWriteActions';
import type { McpAction } from '../actionTypes';

export const organisationActions: McpAction[] = [
	...organisationReadActions,
	...organisationWriteActions,
	...organisationInviteActions,
	...organisationModuleActions,
	...boardroomDirectorActions,
	...boardroomMeetingActions,
	...organisationPeopleActions,
	...organisationProjectActions,
	...companyContextActions,
	...contextRunActions
];
