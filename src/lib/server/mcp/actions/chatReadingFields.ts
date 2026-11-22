import { chatReadingLimits, chatReadingSpans } from '$lib/data/chat/chatReadingRules';
import { objectSchema, textField } from '../actionTypes';

const { mostMessagesRead, usualMessagesRead } = chatReadingLimits;

export const chatOrganisationField = textField('The organisation whose chat this is, as list_organisations gives it; Chat must be switched on for it');

const chatRoomIdField = textField('The room, as list_chat_rooms gives it; an archived room is read too');

const sinceField = {
	type: 'string',
	enum: Object.values(chatReadingSpans),
	description:
		`${chatReadingSpans.unread} (the default): the messages said since you last read the room that you did not write, ` +
		`by the rule the site counts unread by; ${chatReadingSpans.all}: the room's latest messages, whoever has read them`
};

const limitField = {
	type: 'integer',
	minimum: 1,
	maximum: mostMessagesRead,
	description: `The most messages given, the latest of them; leave out for ${usualMessagesRead}, at most ${mostMessagesRead}, as the room on the site shows`
};

export const chatOrganisationSchema = objectSchema({ organisationId: chatOrganisationField }, ['organisationId']);

export const chatRoomReadingSchema = objectSchema(
	{ organisationId: chatOrganisationField, roomId: chatRoomIdField, since: sinceField, limit: limitField },
	['organisationId', 'roomId']
);
