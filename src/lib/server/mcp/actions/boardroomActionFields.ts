import { objectSchema, textField } from '../actionTypes';
import { actionDepartments, boardActionLimits } from '$lib/data/boardroomActionRules';
import { organisationIdField } from './organisationDetailsFields';

const meetingIdField = textField('The meeting id, as list_board_meetings gives it');

export const recordActionSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: { type: 'integer', minimum: 1, description: 'The item for decision the action goes with, by its number as read_board_meeting gives it now' },
		what: {
			type: 'string',
			minLength: 1,
			maxLength: boardActionLimits.longestWhat,
			description: `What is to be done, short enough for a task's title, at most ${boardActionLimits.longestWhat} characters`
		},
		owner: { type: 'string', minLength: 1, description: 'Who owns it: their account id, name or email, as read_organisation lists its people' },
		dueOn: { type: 'string', description: 'The date it is due, as YYYY-MM-DD, only where the meeting gave one' },
		projectId: { type: 'string', description: 'The project under this organisation it is done in, as read_organisation lists its projects; leave out for the owner’s own to-do list' },
		department: { type: 'string', enum: actionDepartments, description: 'With a project only: the department of the job the owner does there' }
	},
	['organisationId', 'meetingId', 'itemNumber', 'what', 'owner']
);

export const raiseActionsSchema = objectSchema({ organisationId: organisationIdField, meetingId: meetingIdField }, ['organisationId', 'meetingId']);
