import { objectSchema, textField } from '../actionTypes';
import { agendaPurposes } from '$lib/data/boardroomMeeting';
import { agendaItemTitleMaximumLength } from '$lib/data/boardroomMeetingRules';
import { organisationIdField } from './organisationDetailsFields';

const titleField = textField(
	`What is to be decided or noted, in ${agendaItemTitleMaximumLength} characters or fewer, such as "Approve the accounts for the year to 31 March"`
);
const purposeField = {
	type: 'string',
	enum: agendaPurposes,
	description: 'decision when the board decides it, noting when it only notes it'
};
const itemNumberField = {
	type: 'integer',
	minimum: 1,
	description: 'The item’s number on the agenda as read_board_meeting gives it now'
};

const agendaItemSchema = objectSchema({ title: titleField, purpose: purposeField }, ['title', 'purpose']);
const agendaListField = (description: string) => ({
	type: 'array',
	items: agendaItemSchema,
	description
});

const meetingIdField = textField('The meeting id, as list_board_meetings gives it');

export const organisationOnlySchema = objectSchema({ organisationId: organisationIdField }, ['organisationId']);

export const meetingSchema = objectSchema({ organisationId: organisationIdField, meetingId: meetingIdField }, [
	'organisationId',
	'meetingId'
]);

export const callMeetingSchema = objectSchema(
	{
		organisationId: organisationIdField,
		date: textField('The day it meets, YYYY-MM-DD'),
		time: textField('When it starts on the UK clock, HH:MM in 24 hours'),
		chair: textField(
			'The sitting director who chairs it, by account id, email or name; leave out to chair it yourself'
		),
		agenda: agendaListField('The agenda in order, at least one item; they are numbered from 1')
	},
	['organisationId', 'date', 'time', 'agenda']
);

const rewordSchema = objectSchema({ number: itemNumberField, title: titleField, purpose: purposeField }, ['number']);

export const changeAgendaSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		add: agendaListField('Items to add after the last one; once the meeting has opened they are any other business'),
		reword: {
			type: 'array',
			items: rewordSchema,
			description: 'Items to reword before the meeting opens: a new title, purpose or both'
		},
		withdraw: {
			type: 'array',
			items: itemNumberField,
			description: 'Numbers of items to withdraw before the meeting opens; each is kept as withdrawn'
		}
	},
	['organisationId', 'meetingId']
);
