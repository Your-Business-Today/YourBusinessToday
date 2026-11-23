import { postedViaChannels } from '$lib/data/conversationTurn';
import type { ChatRoomKeeper } from '$lib/server/chat/chatRoomRecord';
import type { ChatAuthor } from '$lib/server/chat/postChatMessage';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The person a connector's chat action reads or writes as, in the organisation the module gate let them into. */
export function chatKeeperOf(caller: McpCaller, organisation: Organisation): ChatRoomKeeper {
	return { organisationId: organisation.id, accountId: caller.accountId };
}

/** The same person as the author of what their Claude writes in the chat: shown as written through their Claude. */
export function chatAuthorOf(caller: McpCaller, organisation: Organisation): ChatAuthor {
	return { ...chatKeeperOf(caller, organisation), postedVia: postedViaChannels.claude };
}
