import { describe, expect, it } from 'vitest';
import { isDirectoryOrSocialSite, officialWebsiteCandidates } from './officialWebsite';

describe('officialWebsiteCandidates', () => {
	it('takes the homepage of the address the search answered with', () => {
		const answer = 'The official site is:\nhttps://www.acmejoinery.co.uk/about-us.';
		expect(officialWebsiteCandidates(answer)).toEqual(['https://www.acmejoinery.co.uk/']);
	});

	it('finds nothing when the search answered NONE', () => {
		expect(officialWebsiteCandidates('NONE')).toEqual([]);
	});

	it('never picks a social profile or a directory listing', () => {
		const answer = [
			'https://www.linkedin.com/company/acme-joinery',
			'https://facebook.com/acmejoinery',
			'https://x.com/acmejoinery',
			'https://www.instagram.com/acmejoinery',
			'https://find-and-update.company-information.service.gov.uk/company/01234567',
			'https://www.yell.com/biz/acme-joinery',
			'https://acmejoinery.com'
		].join('\n');
		expect(officialWebsiteCandidates(answer)).toEqual(['https://acmejoinery.com/']);
	});

	it('names each site once, with or without www', () => {
		const answer = 'https://acme.co.uk/contact and https://www.acme.co.uk/ and https://acme.uk';
		expect(officialWebsiteCandidates(answer)).toEqual(['https://acme.co.uk/', 'https://acme.uk/']);
	});

	it('refuses private and non-web addresses', () => {
		expect(officialWebsiteCandidates('http://localhost/ ftp://acme.co.uk/')).toEqual([]);
	});

	it('offers at most three sites to read', () => {
		const answer = ['https://one.co.uk', 'https://two.co.uk', 'https://three.co.uk', 'https://four.co.uk'];
		expect(officialWebsiteCandidates(answer.join(' '))).toHaveLength(3);
	});
});

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
