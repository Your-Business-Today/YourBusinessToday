import { describe, expect, it } from 'vitest';
import { portalRequestLimits } from '$lib/portal/portalRequest';
import { validatePortalReply, validatePortalRequest } from './validatePortalRequest';

function formOf(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return formData;
}

describe('a request a client types on the portal', () => {
	it('is raised with its sentence, its description and why it matters, trimmed', () => {
		const form = formOf({ title: ' Add a CSV export ', want: 'Export the jobs list.', benefit: '' });
		expect(validatePortalRequest(form)).toEqual({ title: 'Add a CSV export', want: 'Export the jobs list.', benefit: '' });
	});

	it('is refused without a sentence or a description', () => {
		expect(validatePortalRequest(formOf({ title: '', want: 'Something' }))).toHaveProperty('refusal');
		expect(validatePortalRequest(formOf({ title: 'Something', want: ' ' }))).toHaveProperty('refusal');
	});

	it('is refused, not cut short, when it is longer than the limit', () => {
		const tooLongTitle = 'x'.repeat(portalRequestLimits.titleLength + 1);
		const reading = validatePortalRequest(formOf({ title: tooLongTitle, want: 'Something' }));
		expect(reading).toEqual({ refusal: `The sentence is too long: keep it to ${portalRequestLimits.titleLength} characters.` });
	});
});

describe('a reply a client types on one of their requests', () => {
	it('names the request and carries the reply', () => {
		expect(validatePortalReply(formOf({ taskId: 'task-1', body: 'Thanks' }))).toEqual({ taskId: 'task-1', body: 'Thanks' });
	});

	it('is refused when empty or too long', () => {
		expect(validatePortalReply(formOf({ taskId: 'task-1', body: '' }))).toHaveProperty('refusal');
		const tooLongReply = 'x'.repeat(portalRequestLimits.replyLength + 1);
		expect(validatePortalReply(formOf({ taskId: 'task-1', body: tooLongReply }))).toHaveProperty('refusal');
	});
});
