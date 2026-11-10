import { isDirectoryOrSocialSite } from './officialWebsite';
import { isRefusedSourceHost } from '$lib/data/sightingRules';
import { parsePublicUrl } from './parsePublicUrl';

/** Why a page cannot stand as the source of a finding, or null when it is a public page that may be read. */
export function researchSourceRefusal(fieldName: string, address: string, longest: number): string | null {
	if (address.length > longest) return `The ${fieldName} is at most ${longest} characters.`;
	const page = parsePublicUrl(address);
	if (page === null) return `The ${fieldName} must be the public web page it was read on, such as https://example.com/about.`;
	if (isRefusedSourceHost(page.hostname))
		return `The ${fieldName} is behind a login or on a network whose terms forbid reading it this way; use what a public page says instead.`;
	return null;
}

/** Why an address cannot be kept as the company's own website, or null when it is blank or a public site of its own. */
export function companyWebsiteRefusal(address: string, longest: number): string | null {
	if (address === '') return null;
	if (address.length > longest) return `The website is at most ${longest} characters.`;
	const site = parsePublicUrl(address);
	if (site === null) return 'The website must be a public web address, such as https://example.com.';
	if (isDirectoryOrSocialSite(site.hostname))
		return `${site.hostname} is a directory, a register or a social network, not the company's own website.`;
	return null;
}
