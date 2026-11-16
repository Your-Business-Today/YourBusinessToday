import { describe, expect, it } from 'vitest';
import { domainOfEmail, domainOfWebsite, isDomainOfSite, isOurAddress } from './emailDomains';

describe('email domains', () => {
	it('reads the domain of an address in lower case', () => {
		expect(domainOfEmail('Jo@Acme.CO.uk')).toBe('acme.co.uk');
	});

	it('reads the site of a website written with or without its scheme, www. or a page', () => {
		expect(domainOfWebsite('https://www.acme.co.uk/contact')).toBe('acme.co.uk');
		expect(domainOfWebsite('acme.co.uk')).toBe('acme.co.uk');
		expect(domainOfWebsite('')).toBe('');
		expect(domainOfWebsite('not a website')).toBe('');
	});

	it('counts a part of a site as the site, and never a site that only ends in the same letters', () => {
		expect(isDomainOfSite('mail.acme.co.uk', 'acme.co.uk')).toBe(true);
		expect(isDomainOfSite('notacme.co.uk', 'acme.co.uk')).toBe(false);
		expect(isDomainOfSite('acme.co.uk', '')).toBe(false);
	});

	it('knows our own addresses', () => {
		expect(isOurAddress('consulting@yourbusiness.today')).toBe(true);
		expect(isOurAddress('jo@acme.co.uk')).toBe(false);
	});
});
