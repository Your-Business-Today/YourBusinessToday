import { error, redirect } from '@sveltejs/kit';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import { findChatMessageFile, signChatFileLink } from '$lib/server/chat/findChatMessageFile';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { RequestHandler } from './$types';

const seeOtherStatus = 303;
const notFoundStatus = 404;
const noSuchFile = 'No file said in this organisation’s chat has that id';

/**
 * A file said in the chat opens through a ten-minute signed link, asked for afresh by a reader who can use the
 * organisation's chat each time, so the room's five-second refresh signs nothing and no file has a public address.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	const { organisation } = await requireOrganisationModule(locals, params.organisationId, 'chat');
	const file = await findChatMessageFile(locals.supabase, organisation.id, params.fileId);
	if (file === null) error(notFoundStatus, noSuchFile);
	const link = await signChatFileLink(supabaseServiceClient(), file);
	redirect(seeOtherStatus, link);
};
