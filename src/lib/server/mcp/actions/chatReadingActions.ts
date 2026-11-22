import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { listChatRoomsForReader } from '$lib/server/chat/readChatUnreadCounts';
import { readChatRooms } from '$lib/server/chat/readChatRooms';
import { readChatRoomAsAsked } from '$lib/server/chat/readChatRoomAsAsked';
import { readUnreadInEveryRoom } from '$lib/server/chat/readUnreadInEveryRoom';
import { moduleAction } from '../organisationModuleGate';
import { readText, type McpAction } from '../actionTypes';
import { chatOrganisationSchema, chatRoomReadingSchema } from './chatReadingFields';
import { chatReadingGuidance } from './chatReadingGuidance';
import { describeChatRooms } from './describeChatRooms';
import { describeChatRoomReading, describeChatUnread } from './describeChatRoom';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const readerOf = (caller: McpCaller, organisation: Organisation) => ({ organisationId: organisation.id, accountId: caller.accountId });

const roomNotFound = `${chatMessageRefusals.noSuchRoom} Call list_chat_rooms for the rooms of this organisation and their ids.`;

function refusalOf(refusal: string): string {
	if (refusal === chatMessageRefusals.noSuchRoom) return roomNotFound;
	return refusal;
}

export const chatReadingActions: McpAction[] = [
	moduleAction('chat', {
		name: 'list_chat_rooms',
		area: 'chat',
		audience: 'everyone',
		isWrite: false,
		summary: "list the rooms and subrooms of an organisation's chat, General first, each with its id, what it is for and how much is unread for you",
		guidance: chatReadingGuidance.list,
		inputSchema: chatOrganisationSchema,
		run: async (caller, _input, organisation) => {
			const rooms = await readChatRooms(caller.supabase, organisation.id);
			const listedRooms = await listChatRoomsForReader(caller.supabase, readerOf(caller, organisation), rooms);
			return describeChatRooms(organisation, listedRooms);
		}
	}),
	moduleAction('chat', {
		name: 'read_chat_room',
		area: 'chat',
		audience: 'everyone',
		isWrite: false,
		summary: "read one room of an organisation's chat, oldest to newest: what is new to you, or its latest messages, without marking anything read",
		guidance: chatReadingGuidance.read,
		inputSchema: chatRoomReadingSchema,
		run: async (caller, input, organisation) => {
			const reading = await readChatRoomAsAsked(caller.supabase, readerOf(caller, organisation), readText(input, 'roomId'), input);
			if (typeof reading === 'string') return refusalOf(reading);
			return describeChatRoomReading(organisation.name, reading);
		}
	}),
	moduleAction('chat', {
		name: 'read_chat_unread',
		area: 'chat',
		audience: 'everyone',
		isWrite: false,
		summary: "read everything unread for you in an organisation's chat, room by room, without marking anything read",
		guidance: chatReadingGuidance.unread,
		inputSchema: chatOrganisationSchema,
		run: async (caller, _input, organisation) => {
			const readings = await readUnreadInEveryRoom(caller.supabase, readerOf(caller, organisation));
			return describeChatUnread(organisation.name, readings);
		}
	})
];
