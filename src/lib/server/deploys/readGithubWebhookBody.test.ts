import { describe, expect, it } from 'vitest';
import { readGithubWebhookBody } from './readGithubWebhookBody';

const event = { ref: 'refs/heads/main', repository: { html_url: 'https://github.com/acme/site' } };
const eventJson = JSON.stringify(event);

describe('readGithubWebhookBody', () => {
	it('reads a JSON delivery', () => {
		expect(readGithubWebhookBody('application/json', eventJson)).toEqual(event);
		expect(readGithubWebhookBody('application/json; charset=utf-8', eventJson)).toEqual(event);
	});

	it('reads a form delivery, where the event is the payload field', () => {
		const form = new URLSearchParams({ payload: eventJson }).toString();
		expect(readGithubWebhookBody('application/x-www-form-urlencoded', form)).toEqual(event);
	});

	it('gives nothing for an empty body, broken JSON or another content type', () => {
		expect(readGithubWebhookBody('application/json', '')).toBeNull();
		expect(readGithubWebhookBody('application/json', '{not json')).toBeNull();
		expect(readGithubWebhookBody('application/x-www-form-urlencoded', 'other=1')).toBeNull();
		expect(readGithubWebhookBody('text/plain', eventJson)).toBeNull();
		expect(readGithubWebhookBody(null, eventJson)).toBeNull();
	});
});
