import { describe, expect, it } from 'vitest';
import { checkPublishedUrl } from './checkPublishedUrl';

describe('checking the link to a published piece', () => {
	it('keeps a public web address', () => {
		const publishedUrl = 'https://www.tiktok.com/@jewel/video/1';
		expect(checkPublishedUrl(` ${publishedUrl} `)).toEqual({ publishedUrl });
	});

	it('refuses an address that is not public, or not a web page', () => {
		expect(checkPublishedUrl('http://localhost/post')).toHaveProperty('problem');
		expect(checkPublishedUrl('ftp://example.com/post')).toHaveProperty('problem');
		expect(checkPublishedUrl('')).toHaveProperty('problem');
		expect(checkPublishedUrl(undefined)).toHaveProperty('problem');
	});

	it('refuses a link longer than its column, rather than cutting it', () => {
		const tooLong = `https://example.com/${'x'.repeat(500)}`;
		expect(checkPublishedUrl(tooLong)).toEqual({
			problem: `publishedUrl is ${tooLong.length} characters; keep it to 500`
		});
	});
});
