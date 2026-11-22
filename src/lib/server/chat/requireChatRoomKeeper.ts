import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { RequestEvent } from '@sveltejs/kit';
import type { ChatRoomKeeper } from './chatRoomRecord';

/** The gate every chat write passes: Chat is on for the organisation and the visitor may use it. */
export async function requireChatRoomKeeper({ locals, params }: Pick<RequestEvent, 'locals' | 'params'>): Promise<ChatRoomKeeper> {
	const organisationId = params.organisationId ?? '';
	const { user } = await requireOrganisationModule(locals, organisationId, 'chat');
	return { organisationId, accountId: user.id };
}
