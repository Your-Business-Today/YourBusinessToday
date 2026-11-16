import { companyDetails } from './companyDetails';

const websitePrefix = /^www\./;
const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i;
const secureScheme = 'https://';

/** The part of an address after the @, in lower case. */
export function domainOfEmail(address: string): string {
	const [, domain] = address.toLowerCase().split('@');
	return domain ?? '';
}

/** The site a client's website points at, without its www., or empty when the website is not a web address. */
export function domainOfWebsite(website: string): string {
	const trimmed = website.trim();
	if (trimmed === '') return '';
	const address = hasScheme.test(trimmed) ? trimmed : `${secureScheme}${trimmed}`;
	if (!URL.canParse(address)) return '';
	const { hostname } = new URL(address);
	return hostname.replace(websitePrefix, '');
}

/** Whether mail from the email domain comes from the site: the same domain, or a part of it, as a mail server under the site is. */
export function isDomainOfSite(emailDomain: string, siteDomain: string): boolean {
	if (siteDomain === '') return false;
	return emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`);
}

/** Whether the address is one of our own, at Your Business Today's domain. */
export function isOurAddress(address: string): boolean {
	return isDomainOfSite(domainOfEmail(address), domainOfWebsite(companyDetails.websiteUrl));
}
