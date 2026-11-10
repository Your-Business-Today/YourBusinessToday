import { describe, expect, it } from 'vitest';
import { isDirectoryOrSocialSite } from './officialWebsite';

describe('isDirectoryOrSocialSite', () => {
	it.each(['linkedin.com', 'uk.linkedin.com', 'WWW.FACEBOOK.COM', 'www.companieshouse.gov.uk'])(
		'recognises %s',
		(hostname) => {
			expect(isDirectoryOrSocialSite(hostname)).toBe(true);
		}
	);

	it.each(['acme.co.uk', 'notlinkedin.com', 'box.com'])('lets the company site %s through', (hostname) => {
		expect(isDirectoryOrSocialSite(hostname)).toBe(false);
	});
});
