import { validateMoveOverConnector } from '$lib/data/chat/chatWritingRules';
import { createChatRoom } from '$lib/server/chat/keepChatRooms';
import { markRoomReadInOrganisation } from '$lib/server/chat/markChatRoomRead';
import { moveChatMessages } from '$lib/server/chat/moveChatMessages';
import { postChatMessage } from '$lib/server/chat/postChatMessage';
import { recordChatSummary } from '$lib/server/chat/recordChatSummary';
import { updateChatRoom } from '$lib/server/chat/updateChatRoom';
import { moduleAction } from '../organisationModuleGate';
import { readText, type McpAction } from '../actionTypes';
import { chatAuthorOf, chatKeeperOf } from './chatConnectorCaller';
import { chatConnectorRefusal } from './chatConnectorRefusals';
import { chatMoveSchema, chatPostingSchema, chatRoomMarkingSchema, chatRoomOpeningSchema, chatRoomUpdateSchema, chatSummarySchema } from './chatWritingFields';
import { chatWritingGuidance } from './chatWritingGuidance';
import { describeMadeMove, describeOpenedRoom, describePostedMessage, describeRoomMarkedRead, describeUpdatedRoom } from './describeChatWrites';
import { describeRecordedSummary } from './describeChatSummary';

const writesInTheChat = { area: 'chat', audience: 'everyone', isWrite: true } as const;

export const chatWritingActions: McpAction[] = [
	moduleAction('chat', {
		name: 'post_chat_message',
		...writesInTheChat,
		summary: "say something in a room of an organisation's chat as the person you act for, shown as said through their Claude",
		guidance: chatWritingGuidance.post,
		inputSchema: chatPostingSchema,
		run: async (caller, input, organisation) => {
			const posted = await postChatMessage(caller.supabase, chatAuthorOf(caller, organisation), readText(input, 'roomId'), { body: input.body });
			if (typeof posted === 'string') return chatConnectorRefusal(posted);
			return describePostedMessage(organisation.name, posted);
		}
	}),
	moduleAction('chat', {
		name: 'create_chat_room',
		...writesInTheChat,
		summary: "open a room in an organisation's chat, or a subroom under one of its rooms, with its name and what it is for",
		guidance: chatWritingGuidance.open,
		inputSchema: chatRoomOpeningSchema,
		run: async (caller, input, organisation) => {
			const created = await createChatRoom(caller.supabase, chatKeeperOf(caller, organisation), input);
			if (typeof created === 'string') return chatConnectorRefusal(created);
			return describeOpenedRoom(organisation.name, created);
		}
	}),
	moduleAction('chat', {
		name: 'update_chat_room',
		...writesInTheChat,
		summary: "rename a room of an organisation's chat, say again what it is for, put it under another room, or archive it",
		guidance: chatWritingGuidance.update,
		inputSchema: chatRoomUpdateSchema,
		run: async (caller, input, organisation) => {
			const updated = await updateChatRoom(caller.supabase, organisation.id, input);
			if (typeof updated === 'string') return chatConnectorRefusal(updated);
			return describeUpdatedRoom(organisation.name, updated);
		}
	}),
	moduleAction('chat', {
		name: 'move_chat_messages',
		...writesInTheChat,
		summary: "move messages from one room of an organisation's chat to another, all of them or none, leaving a line where they were",
		guidance: chatWritingGuidance.move,
		inputSchema: chatMoveSchema,
		run: async (caller, input, organisation) => {
			const asked = validateMoveOverConnector(input);
			if (typeof asked === 'string') return asked;
			const moved = await moveChatMessages(caller.supabase, chatKeeperOf(caller, organisation), readText(input, 'fromRoomId'), asked);
			if (typeof moved === 'string') return chatConnectorRefusal(moved);
			return describeMadeMove(moved);
		}
	}),
	moduleAction('chat', {
		name: 'record_chat_summary',
		...writesInTheChat,
		summary: "save a catch-up you wrote of a room of an organisation's chat, for everyone in it who has been away",
		guidance: chatWritingGuidance.catchUp,
		inputSchema: chatSummarySchema,
		run: async (caller, input, organisation) => {
			const recorded = await recordChatSummary(caller.supabase, chatAuthorOf(caller, organisation), readText(input, 'roomId'), input);
			if (typeof recorded === 'string') return chatConnectorRefusal(recorded);
			return describeRecordedSummary(organisation.name, recorded);
		}
	}),
	moduleAction('chat', {
		name: 'mark_chat_room_read',
		...writesInTheChat,
		summary: "mark a room of an organisation's chat read for you, once the person has heard what was new in it, and read its notification",
		guidance: chatWritingGuidance.markRead,
		inputSchema: chatRoomMarkingSchema,
		run: async (caller, input, organisation) => {
			const marked = await markRoomReadInOrganisation(caller.supabase, chatKeeperOf(caller, organisation), readText(input, 'roomId'));
			if (typeof marked === 'string') return chatConnectorRefusal(marked);
			return describeRoomMarkedRead(marked);
		}
	})
];
