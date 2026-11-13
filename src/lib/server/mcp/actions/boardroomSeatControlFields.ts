import { objectSchema, textField } from '../actionTypes';
import { allSeatSettings } from '$lib/data/boardroomSeatControls';
import { seatControlLimits } from '$lib/data/boardroomSeatControlRules';
import { yesOrNo } from '$lib/data/validateSeatControl';
import { organisationIdField } from './organisationDetailsFields';

const { longestSteerNote } = seatControlLimits;
const meetingIdField = textField('The meeting id, as list_board_meetings gives it');

export const steerSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		words: { type: 'string', maxLength: longestSteerNote, description: `Your director’s note to you, in their words, at most ${longestSteerNote} characters` }
	},
	['organisationId', 'meetingId', 'words']
);

export const settingSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		setting: { type: 'string', enum: allSeatSettings, description: 'paused: you say nothing in the room; ask_me_first: each piece you speak is held for their yes' },
		isOn: { type: 'boolean', description: 'True to turn the setting on, false to turn it off' }
	},
	['organisationId', 'meetingId', 'setting', 'isOn']
);

export const heldAnswerSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		heldId: textField('The held piece, by the id the meeting page or read_board_item gives it'),
		answer: { type: 'string', enum: Object.values(yesOrNo), description: 'yes says the piece in the room, in your turn; no keeps it unsaid' }
	},
	['organisationId', 'meetingId', 'heldId', 'answer']
);
