import { boardroomDirectorActions } from './boardroomDirectorActions';
import { boardroomMeetingActions } from './boardroomMeetingActions';
import { boardroomPaperActions } from './boardroomPaperActions';
import { boardroomBriefActions } from './boardroomBriefActions';
import { boardroomRoomActions } from './boardroomRoomActions';
import { boardroomSeatControlActions } from './boardroomSeatControlActions';
import { boardroomDecisionActions } from './boardroomDecisionActions';
import { boardroomMinutesActions } from './boardroomMinutesActions';
import { boardroomActionActions } from './boardroomActionActions';
import type { McpAction } from '../actionTypes';

export const boardroomActions: McpAction[] = [
	...boardroomDirectorActions,
	...boardroomMeetingActions,
	...boardroomPaperActions,
	...boardroomBriefActions,
	...boardroomRoomActions,
	...boardroomSeatControlActions,
	...boardroomDecisionActions,
	...boardroomMinutesActions,
	...boardroomActionActions
];
