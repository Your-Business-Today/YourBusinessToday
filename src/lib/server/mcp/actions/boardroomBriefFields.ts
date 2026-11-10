import { objectSchema, textField } from '../actionTypes';
import { boardBriefLimits } from '$lib/data/boardroomBriefRules';
import { organisationIdField } from './organisationDetailsFields';

const { longestPart } = boardBriefLimits;
const meetingIdField = textField('The meeting id, as list_board_meetings gives it');
const itemNumberField = {
	type: 'integer',
	minimum: 1,
	description: 'The agenda item the brief is on, by its number as read_board_meeting gives it now'
};
const partField = (what: string) => ({ type: 'string', maxLength: longestPart, description: `${what}, at most ${longestPart} characters` });

export const briefItemSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: itemNumberField,
		position: partField("The director's own position on the item, in their words"),
		mayShare: partField('What their Claude may share with the other directors in the room; leave out when nothing is said'),
		mustNotShare: partField('What their Claude must keep back; leave out when nothing is said'),
		mustComeBack: partField('What must come back to the director before it goes further; leave out when nothing is said')
	},
	['organisationId', 'meetingId', 'itemNumber', 'position']
);

export const readBriefSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: itemNumberField,
		version: { type: 'integer', minimum: 1, description: 'One version of the brief by its number; leave out for the latest' }
	},
	['organisationId', 'meetingId', 'itemNumber']
);
