import { chatDecisionLimits, chatDecisionStatuses } from '$lib/data/chat/chatDecisionRules';
import { objectSchema, textField } from '../actionTypes';
import { chatOrganisationField } from './chatReadingFields';

const { longestWording, longestOutcome, latestDecisionsShown, usualDecisionsListed } = chatDecisionLimits;

const listedRoomField = textField('The room whose decisions to list, archived or not, as list_chat_rooms gives it; "" or left out for every room');

const statusField = {
	type: 'string',
	enum: Object.values(chatDecisionStatuses),
	description:
		`${chatDecisionStatuses.open}: the decisions still waiting on someone; ${chatDecisionStatuses.closed}: those closed with an outcome; ` +
		'leave out for both, the open ones first'
};

const limitField = {
	type: 'integer',
	minimum: 1,
	maximum: latestDecisionsShown,
	description: `The most decisions given, open ones first; leave out for ${usualDecisionsListed}, at most ${latestDecisionsShown}, as the site shows`
};

const wordingField = {
	type: 'string',
	minLength: 1,
	maxLength: longestWording,
	description: `The decision to be taken, in the person's own words, 1 to ${longestWording} characters`
};

const waitingOnField = textField(
	'The person of the organisation the decision waits on, as the person you act for named them: their account id, ' +
		'email address or name, matched as the site matches it; never guessed'
);

const outcomeField = {
	type: 'string',
	minLength: 1,
	maxLength: longestOutcome,
	description: `What was decided, as the person gave it, 1 to ${longestOutcome} characters; a closed decision is never reopened or changed`
};

export const chatDecisionListingSchema = objectSchema(
	{ organisationId: chatOrganisationField, roomId: listedRoomField, status: statusField, limit: limitField },
	['organisationId']
);

export const chatDecisionRaisingSchema = objectSchema(
	{
		organisationId: chatOrganisationField,
		roomId: textField('The room the message is in now, not archived, as list_chat_rooms gives it'),
		messageId: textField('The message the decision comes from, as read_chat_room gives it'),
		wording: wordingField,
		waitingOn: waitingOnField
	},
	['organisationId', 'roomId', 'messageId', 'wording', 'waitingOn']
);

export const chatDecisionClosingSchema = objectSchema(
	{ organisationId: chatOrganisationField, decisionId: textField('The open decision to close, as list_chat_decisions gives it'), outcome: outcomeField },
	['organisationId', 'decisionId', 'outcome']
);
