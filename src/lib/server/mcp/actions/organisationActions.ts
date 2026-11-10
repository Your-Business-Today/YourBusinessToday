import { boardroomDirectorActions } from './boardroomDirectorActions';
import { boardroomMeetingActions } from './boardroomMeetingActions';
import { boardroomPaperActions } from './boardroomPaperActions';
import { boardroomBriefActions } from './boardroomBriefActions';
import { boardroomRoomActions } from './boardroomRoomActions';
import { boardroomDecisionActions } from './boardroomDecisionActions';
import { boardroomMinutesActions } from './boardroomMinutesActions';
import { boardroomActionActions } from './boardroomActionActions';
import { companyContextActions } from './companyContextActions';
import { confirmedContextActions } from './confirmedContextActions';
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
	...boardroomPaperActions,
	...boardroomBriefActions,
	...boardroomRoomActions,
	...boardroomDecisionActions,
	...boardroomMinutesActions,
	...boardroomActionActions,
	...organisationPeopleActions,
	...organisationProjectActions,
	...companyContextActions,
	...confirmedContextActions,
	...contextRunActions
];
