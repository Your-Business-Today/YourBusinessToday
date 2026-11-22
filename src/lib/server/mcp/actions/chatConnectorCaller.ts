import type { ChatRoomKeeper } from '$lib/server/chat/chatRoomRecord';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The person a connector's chat action reads or writes as, in the organisation the module gate let them into. */
export function chatKeeperOf(caller: McpCaller, organisation: Organisation): ChatRoomKeeper {
	return { organisationId: organisation.id, accountId: caller.accountId };
}
