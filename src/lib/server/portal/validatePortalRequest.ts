import { isUuid } from '$lib/data/isUuid';
import { portalRequestLimits } from '$lib/portal/portalRequest';
import { tooLong, type Refusal, type ValueReader } from './portalFormReading';

export type PortalRequestSeed = { title: string; want: string; benefit: string };

export type PortalReply = { taskId: string; body: string };

/** The request a client typed, or why it cannot be raised as it stands. */
export function validatePortalRequest(read: ValueReader): PortalRequestSeed | Refusal {
	const title = read('title');
	const want = read('want');
	const benefit = read('benefit');
	if (title === '') return { refusal: 'Say in a sentence what you need.' };
	if (want === '') return { refusal: 'Describe what you need in your own words.' };
	if (title.length > portalRequestLimits.titleLength)
		return tooLong('The sentence', portalRequestLimits.titleLength);
	if (want.length > portalRequestLimits.wantLength)
		return tooLong('The description', portalRequestLimits.wantLength);
	if (benefit.length > portalRequestLimits.benefitLength)
		return tooLong('Why it matters', portalRequestLimits.benefitLength);
	return { title, want, benefit };
}

/** The reply a client typed on one of their requests, or why it cannot be posted. */
export function validatePortalReply(read: ValueReader): PortalReply | Refusal {
	const taskId = read('taskId');
	const body = read('body');
	if (!isUuid(taskId)) return { refusal: 'Which request is this reply for?' };
	if (body === '') return { refusal: 'Write your reply first.' };
	if (body.length > portalRequestLimits.replyLength)
		return tooLong('The reply', portalRequestLimits.replyLength);
	return { taskId, body };
}

/** The project a connector call names, when it reads as a project id; null for anything else. */
export function validatePortalProjectId(projectId: string): string | null {
	if (!isUuid(projectId)) return null;
	return projectId;
}
