import { chatMessageLimits } from '$lib/data/chat/chatMessageRules';
import { chatMoveLimits } from '$lib/data/chat/chatMoveRules';
import { chatRoomLimits } from '$lib/data/chat/chatRoomRules';
import { objectSchema, textField } from '../actionTypes';
import { chatOrganisationField } from './chatReadingFields';

const { longestBody } = chatMessageLimits;
const { longestName, longestPurpose } = chatRoomLimits;
const { mostMessagesInOneMove } = chatMoveLimits;

const roomField = (description: string) => textField(`${description}, as list_chat_rooms gives it`);

const bodyField = {
	type: 'string',
	minLength: 1,
	maxLength: longestBody,
	description: `What the person says, 1 to ${longestBody} characters; the room shows it as said by them through their Claude`
};

const nameField = { type: 'string', minLength: 1, maxLength: longestName, description: `The room's name, 1 to ${longestName} characters` };

const purposeField = { type: 'string', maxLength: longestPurpose, description: `What the room is for, at most ${longestPurpose} characters` };

const parentRoomField = roomField('The room this one sits under, itself under no room and not archived; "" or left out for none');

const messagesField = {
	type: 'array',
	items: { type: 'string' },
	minItems: 1,
	maxItems: mostMessagesInOneMove,
	description: `The messages to move, 1 to ${mostMessagesInOneMove} of them, each as read_chat_room gives it; every one must be in the room they leave`
};

const archivingField = {
	type: 'boolean',
	description: 'true archives the room, in a call of its own, as the site archives it; an archived room is never brought back'
};

export const chatPostingSchema = objectSchema(
	{ organisationId: chatOrganisationField, roomId: roomField('The room to say it in, not archived'), body: bodyField },
	['organisationId', 'roomId', 'body']
);

export const chatRoomOpeningSchema = objectSchema(
	{ organisationId: chatOrganisationField, name: nameField, purpose: purposeField, parentRoomId: parentRoomField },
	['organisationId', 'name']
);

export const chatRoomUpdateSchema = objectSchema(
	{
		organisationId: chatOrganisationField,
		roomId: roomField('The room to change or archive, not archived'),
		name: nameField,
		purpose: purposeField,
		parentRoomId: parentRoomField,
		isArchived: archivingField
	},
	['organisationId', 'roomId']
);

export const chatMoveSchema = objectSchema(
	{
		organisationId: chatOrganisationField,
		fromRoomId: roomField('The room the messages are in now'),
		toRoomId: roomField('The room to send them to, not archived'),
		messageIds: messagesField
	},
	['organisationId', 'fromRoomId', 'toRoomId', 'messageIds']
);

export const chatRoomMarkingSchema = objectSchema(
	{ organisationId: chatOrganisationField, roomId: roomField('The room to mark read for you, archived or not') },
	['organisationId', 'roomId']
);
