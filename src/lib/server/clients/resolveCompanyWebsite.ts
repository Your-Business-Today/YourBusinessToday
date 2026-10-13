import { fetchCompanyPages } from './fetchCompanyPages';
import { isAnthropicConfigured } from '$lib/server/anthropic/isAnthropicConfigured';
import { parsePublicUrl } from './parsePublicUrl';
import { searchForCompanyWebsite } from './searchForCompanyWebsite';
import type { CompanyIdentity } from './companyIdentity';
import type { PublicPage } from './fetchPublicPage';

export type CompanyWebsite = { url: string; pages: PublicPage[] };

const guessedDomainSuffixes = ['.co.uk', '.com', '.uk'];
const guessedHostPrefixes = ['www.', ''];
const companySuffixPattern = /\b(ltd|limited|plc|llp|group|co)\b\.?/gi;

export async function resolveCompanyWebsite(
	query: string,
	company: CompanyIdentity
): Promise<CompanyWebsite | null> {
	const guessedWebsite = await firstReadableWebsite(candidateUrlsFor(query));
	if (guessedWebsite !== null) return guessedWebsite;
	if (isWebAddressQuery(query)) return null;
	if (!isAnthropicConfigured()) return null;
	return firstReadableWebsite(await searchedWebsiteUrls(company));
}

export function isWebAddressQuery(query: string): boolean {
	return parsePublicUrl(withScheme(query)) !== null && /\./.test(query) && !/\s/.test(query);
}

async function firstReadableWebsite(candidateUrls: string[]): Promise<CompanyWebsite | null> {
	for (const candidate of candidateUrls) {
		const pages = await fetchCompanyPages(candidate);
		if (pages.length > 0) return { url: pages[0].url, pages };
	}
	return null;
}

async function searchedWebsiteUrls(company: CompanyIdentity): Promise<string[]> {
	try {
		return await searchForCompanyWebsite(company);
	} catch (failure) {
		console.error('Searching the web for a company website failed', failure);
		return [];
	}
}

function candidateUrlsFor(query: string): string[] {
	if (isWebAddressQuery(query)) return [withScheme(query)];
	const slug = query.replace(companySuffixPattern, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
	if (slug === '') return [];
	return guessedDomainSuffixes.flatMap((suffix) =>
		guessedHostPrefixes.map((prefix) => `https://${prefix}${slug}${suffix}`)
	);
}

function withScheme(query: string): string {
	if (/^https?:\/\//i.test(query)) return query;
	return `https://${query}`;
}
