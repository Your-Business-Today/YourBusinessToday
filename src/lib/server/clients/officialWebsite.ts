import { parsePublicUrl } from './parsePublicUrl';
import { websiteDirectoryHosts } from './websiteDirectoryHosts';

const mostCandidates = 3;
const webAddressPattern = /https?:\/\/[^\s<>"'()[\]]+/gi;
const trailingPunctuationPattern = /[.,;:!?*]+$/;
const leadingWwwPattern = /^www\./i;

export function officialWebsiteCandidates(answer: string): string[] {
	const answeredAddresses = answer.match(webAddressPattern) ?? [];
	const homepages = new Map<string, string>();
	for (const address of answeredAddresses) {
		const homepage = companyHomepageOf(address);
		if (homepage === null) continue;
		const siteName = siteNameOf(homepage);
		if (!homepages.has(siteName)) homepages.set(siteName, homepage.href);
	}
	return [...homepages.values()].slice(0, mostCandidates);
}

export function isDirectoryOrSocialSite(hostname: string): boolean {
	const siteName = hostname.toLowerCase();
	return websiteDirectoryHosts.some((host) => siteName === host || siteName.endsWith(`.${host}`));
}

function companyHomepageOf(address: string): URL | null {
	const parsed = parsePublicUrl(address.replace(trailingPunctuationPattern, ''));
	if (parsed === null) return null;
	if (isDirectoryOrSocialSite(parsed.hostname)) return null;
	return new URL(parsed.origin);
}

function siteNameOf(homepage: URL): string {
	return homepage.hostname.replace(leadingWwwPattern, '');
}
