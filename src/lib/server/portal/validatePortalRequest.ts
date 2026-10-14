import { portalRequestLimits } from '$lib/portal/portalRequest';
import { textOf, tooLong, type Refusal } from './portalFormReading';

export type PortalRequestSeed = { title: string; want: string; benefit: string };

export type PortalReply = { taskId: string; body: string };

/** The request a client typed, or why it cannot be raised as it stands. */
export function validatePortalRequest(formData: FormData): PortalRequestSeed | Refusal {
	const title = textOf(formData, 'title');
	const want = textOf(formData, 'want');
	const benefit = textOf(formData, 'benefit');
	if (title === '') return { refusal: 'Say in a sentence what you need.' };
	if (want === '') return { refusal: 'Describe what you need in your own words.' };
	if (title.length > portalRequestLimits.titleLength)
		return tooLong('The sentence', portalRequestLimits.titleLength);
	if (want.length > portalRequestLimits.wantLength) return tooLong('The description', portalRequestLimits.wantLength);
	if (benefit.length > portalRequestLimits.benefitLength)
		return tooLong('Why it matters', portalRequestLimits.benefitLength);
	return { title, want, benefit };
}

/** The reply a client typed on one of their requests, or why it cannot be posted. */
export function validatePortalReply(formData: FormData): PortalReply | Refusal {
	const taskId = textOf(formData, 'taskId');
	const body = textOf(formData, 'body');
	if (taskId === '') return { refusal: 'Which request is this reply for?' };
	if (body === '') return { refusal: 'Write your reply first.' };
	if (body.length > portalRequestLimits.replyLength) return tooLong('The reply', portalRequestLimits.replyLength);
	return { taskId, body };
}
