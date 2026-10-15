import { describe, expect, it } from 'vitest';
import { portalRequestLimits } from '$lib/portal/portalRequest';
import { formValues, inputValues } from './portalFormReading';
import {
	validatePortalProjectId,
	validatePortalReply,
	validatePortalRequest
} from './validatePortalRequest';

const requestId = '3f0c1b2a-5d4e-4f6a-8b9c-0d1e2f3a4b5c';

function formOf(fields: Record<string, string>) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return formValues(formData);
}

describe('a request a client types on the portal', () => {
	it('is raised with its sentence, its description and why it matters, trimmed', () => {
		const form = formOf({
			title: ' Add a CSV export ',
			want: 'Export the jobs list.',
			benefit: ''
		});
		expect(validatePortalRequest(form)).toEqual({
			title: 'Add a CSV export',
			want: 'Export the jobs list.',
			benefit: ''
		});
	});

	it('reads the same from a connector call as from the form', () => {
		const input = { title: 'Add a CSV export', want: 'Export the jobs list.' };
		expect(validatePortalRequest(inputValues(input))).toEqual({ ...input, benefit: '' });
	});

	it('is refused without a sentence or a description', () => {
		expect(validatePortalRequest(formOf({ title: '', want: 'Something' }))).toHaveProperty(
			'refusal'
		);
		expect(validatePortalRequest(formOf({ title: 'Something', want: ' ' }))).toHaveProperty(
			'refusal'
		);
	});

	it('is refused, not cut short, when it is longer than the limit', () => {
		const tooLongTitle = 'x'.repeat(portalRequestLimits.titleLength + 1);
		const reading = validatePortalRequest(formOf({ title: tooLongTitle, want: 'Something' }));
		expect(reading).toEqual({
			refusal: `The sentence is too long: keep it to ${portalRequestLimits.titleLength} characters.`
		});
	});
});

describe('a reply a client types on one of their requests', () => {
	it('names the request and carries the reply', () => {
		expect(validatePortalReply(formOf({ taskId: requestId, body: 'Thanks' }))).toEqual({
			taskId: requestId,
			body: 'Thanks'
		});
	});

	it('is refused when the request is not named by its id', () => {
		expect(validatePortalReply(formOf({ taskId: 'task-1', body: 'Thanks' }))).toHaveProperty(
			'refusal'
		);
	});

	it('is refused when empty or too long', () => {
		expect(validatePortalReply(formOf({ taskId: requestId, body: '' }))).toHaveProperty('refusal');
		const tooLongReply = 'x'.repeat(portalRequestLimits.replyLength + 1);
		expect(validatePortalReply(formOf({ taskId: requestId, body: tooLongReply }))).toHaveProperty(
			'refusal'
		);
	});
});

describe('a project a connector call names', () => {
	it('is read when it is a project id and refused otherwise', () => {
		expect(validatePortalProjectId(requestId)).toBe(requestId);
		expect(validatePortalProjectId('project-1')).toBeNull();
	});
});
