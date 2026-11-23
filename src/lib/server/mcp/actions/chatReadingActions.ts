import { listChatRoomsForReader } from '$lib/server/chat/readChatUnreadCounts';
import { readChatRooms } from '$lib/server/chat/readChatRooms';
import { readChatRoomAsAsked } from '$lib/server/chat/readChatRoomAsAsked';
import { readUnreadInEveryRoom } from '$lib/server/chat/readUnreadInEveryRoom';
import { signChatReadingLinks } from '$lib/server/chat/signChatReadingLinks';
import { moduleAction } from '../organisationModuleGate';
import { readText, type McpAction } from '../actionTypes';
import { chatOrganisationSchema, chatRoomReadingSchema } from './chatReadingFields';
import { chatReadingGuidance } from './chatReadingGuidance';
import { describeChatRooms } from './describeChatRooms';
import { describeChatRoomReading, describeChatUnread } from './describeChatRoom';
import { chatKeeperOf } from './chatConnectorCaller';
import { chatConnectorRefusal } from './chatConnectorRefusals';

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
			const listedRooms = await listChatRoomsForReader(caller.supabase, chatKeeperOf(caller, organisation), rooms);
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
			const reading = await readChatRoomAsAsked(caller.supabase, chatKeeperOf(caller, organisation), readText(input, 'roomId'), input);
			if (typeof reading === 'string') return chatConnectorRefusal(reading);
			const links = await signChatReadingLinks(caller.supabase, [reading]);
			return describeChatRoomReading(organisation.name, reading, links);
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
			const readings = await readUnreadInEveryRoom(caller.supabase, chatKeeperOf(caller, organisation));
			const links = await signChatReadingLinks(caller.supabase, readings);
			return describeChatUnread(organisation.name, readings, links);
		}
	})
];
