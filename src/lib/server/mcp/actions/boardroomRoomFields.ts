import { objectSchema, textField } from '../actionTypes';
import { boardRoomLimits } from '$lib/data/boardroomRoomRules';
import { contributionStances } from '$lib/data/boardroomRoom';
import { organisationIdField } from './organisationDetailsFields';

const { usualRounds, mostRounds, longestWords, longestWording } = boardRoomLimits;
const meetingIdField = textField('The meeting id, as list_board_meetings gives it');
const itemNumberField = { type: 'integer', minimum: 1, description: 'The agenda item, by its number as read_board_meeting gives it now' };
const contributionNumberField = (description: string) => ({ type: 'integer', minimum: 1, description });

export const openRoomSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		roundsLimit: {
			type: 'integer',
			minimum: 1,
			maximum: mostRounds,
			description: `How many rounds each item is talked through at most, every Claude speaking once a round; leave out for ${usualRounds}`
		}
	},
	['organisationId', 'meetingId']
);

export const readItemSchema = objectSchema(
	{ organisationId: organisationIdField, meetingId: meetingIdField, itemNumber: itemNumberField },
	['organisationId', 'meetingId', 'itemNumber']
);

export const speakSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: meetingIdField,
		itemNumber: itemNumberField,
		stance: {
			type: 'string',
			enum: contributionStances,
			description:
				'proposes a wording for the directors; supports the wording on the table; objects to it; or comments without taking a stance'
		},
		words: { type: 'string', maxLength: longestWords, description: `What you say for your director, at most ${longestWords} characters` },
		wording: {
			type: 'string',
			maxLength: longestWording,
			description: `With proposes only: the wording proposed for the directors, at most ${longestWording} characters`
		},
		proposalNumber: contributionNumberField(
			'With supports (required) or objects: the number of the contribution whose wording you speak on, as read_board_item gives it'
		),
		corrects: contributionNumberField('The number of your own earlier contribution on this item that this one corrects; leave out otherwise')
	},
	['organisationId', 'meetingId', 'itemNumber', 'stance', 'words']
);
