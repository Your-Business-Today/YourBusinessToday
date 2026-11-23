import { actionResultTypes } from '$lib/client/actionResultTypes';
import { postAction } from '$lib/components/projects/uploadThroughSignedLink';
import type { ChatFileSent } from '$lib/data/chat/validateChatMessage';
import type { ActionResult } from '@sveltejs/kit';

/** The room's own grant, asked from the room's page; another page asks it at the room's path. */
export const roomGrantAction = '?/grantChatFile';

/** The room's own posting, asked at the room's path from another page, as the room's composer asks it. */
export const roomPostAction = '?/postMessage';

export const couldNotBeSent = 'That file could not be sent. Check your connection, take it off and attach it again.';

type Granted = { uploadUrl: string; storagePath: string };

function grantedOf(answer: Record<string, unknown>): Granted {
	return { uploadUrl: String(answer.uploadUrl ?? ''), storagePath: String(answer.storagePath ?? '') };
}

/** What the grant answered with, success or refusal alike; nothing for a redirect or an error. */
export function answerOf(result: ActionResult): Record<string, unknown> {
	const hasAnswer = result.type === actionResultTypes.failure || result.type === actionResultTypes.success;
	if (!hasAnswer) return {};
	return result.data ?? {};
}

/**
 * Sends one file to storage through the link the room's grantChatFile action signs for it, ready to be named on a
 * message the room's postMessage action posts; or says why it could not be sent.
 */
export async function sendChatFile(file: File, grantAction: string = roomGrantAction): Promise<ChatFileSent | string> {
	const facts = { fileName: file.name, contentType: file.type, sizeBytes: file.size };
	const grant = await postAction(grantAction, facts);
	const answer = answerOf(grant);
	if (grant.type === actionResultTypes.failure) return String(answer.message ?? couldNotBeSent);
	if (grant.type !== actionResultTypes.success) return couldNotBeSent;
	const { uploadUrl, storagePath } = grantedOf(answer);
	const stored = await fetch(uploadUrl, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
	if (!stored.ok) return couldNotBeSent;
	return { storagePath, fileName: file.name };
}
