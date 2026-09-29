import { describe, expect, it } from 'vitest';
import { isForbiddenCrossSiteForm } from './crossSiteFormSubmission';

const site = 'https://yourbusiness.today';
const formContentType = 'application/x-www-form-urlencoded';

function post(path: string, headers: Record<string, string>): [Request, URL] {
	const url = new URL(path, site);
	return [new Request(url, { method: 'POST', headers, body: 'a=1' }), url];
}

describe('isForbiddenCrossSiteForm', () => {
	it('lets a form through from the site itself', () => {
		const [request, url] = post('/projects', { 'content-type': formContentType, origin: site });
		expect(isForbiddenCrossSiteForm(request, url)).toBe(false);
	});

	it('refuses a form posted from elsewhere, or with no origin at all', () => {
		const [fromElsewhere, url] = post('/projects', {
			'content-type': formContentType,
			origin: 'https://evil.example'
		});
		expect(isForbiddenCrossSiteForm(fromElsewhere, url)).toBe(true);
		const [withoutOrigin] = post('/projects', { 'content-type': formContentType });
		expect(isForbiddenCrossSiteForm(withoutOrigin, url)).toBe(true);
	});

	it('leaves the GitHub webhook and the token endpoint to their own guards', () => {
		const [webhook, webhookUrl] = post('/api/github-webhook', { 'content-type': formContentType });
		expect(isForbiddenCrossSiteForm(webhook, webhookUrl)).toBe(false);
		const [token, tokenUrl] = post('/oauth/token', { 'content-type': formContentType });
		expect(isForbiddenCrossSiteForm(token, tokenUrl)).toBe(false);
	});

	it('is not concerned with JSON bodies or reads', () => {
		const [json, url] = post('/projects', { 'content-type': 'application/json' });
		expect(isForbiddenCrossSiteForm(json, url)).toBe(false);
		const getUrl = new URL('/projects', site);
		expect(isForbiddenCrossSiteForm(new Request(getUrl), getUrl)).toBe(false);
	});
});
