import { objectSchema } from '../actionTypes';
import { boardMinutesLimits } from '$lib/data/boardroomMinutesRules';
import { allMinutesAnswers } from '$lib/data/boardroomMinutes';
import { meetingIdField } from './boardroomMeetingFields';
import { organisationIdField } from './organisationDetailsFields';

const { longestWords, longestChangeWords } = boardMinutesLimits;

export const closeMeetingSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		closeWithItemsWaiting: {
			type: 'boolean',
			description: 'true only when the chair has told you to close while an item or a decision is still waiting; left out, it is false'
		}
	},
	['organisationId', 'meetingId']
);

export const writeMinutesSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		words: {
			type: 'string',
			maxLength: longestWords,
			description: `The minutes in your words, from read_board_minutes alone: what was said on each item in short, and the actions agreed. At most ${longestWords} characters`
		}
	},
	['organisationId', 'meetingId', 'words']
);

export const answerMinutesSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		version: { type: 'integer', minimum: 1, description: 'The number of the latest version of the minutes, as read_board_minutes gives it' },
		answer: { type: 'string', enum: allMinutesAnswers, description: 'Your director’s own answer, in their words to you now: approves, or asks_for_change' },
		changeWords: {
			type: 'string',
			maxLength: longestChangeWords,
			description: `What your director asks to change, in their words, when they ask for a change; at most ${longestChangeWords} characters`
		}
	},
	['organisationId', 'meetingId', 'version', 'answer']
);
