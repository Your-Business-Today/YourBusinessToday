import { companyResearchSystemPrompt, companyResearchTool } from './companyResearchPrompt';
import { parseResearchedProfile, type ResearchedProfile } from './researchedProfile';
import { resolveCompanyWebsite } from './resolveCompanyWebsite';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import type { PublicPage } from './fetchPublicPage';

const longestProfileTokens = 2500;

export type ResearchOutcome =
	| { kind: 'researched'; profile: ResearchedProfile }
	| { kind: 'no_website'; message: string };

export const researchOutcomeKinds = { researched: 'researched', noWebsite: 'no_website' } as const;

export async function researchCompany(query: string): Promise<ResearchOutcome> {
	const website = await resolveCompanyWebsite(query);
	if (website === null) {
		return {
			kind: 'no_website',
			message: `No readable website was found for "${query}" — paste the address instead.`
		};
	}
	const response = await requestAnthropic({
		system: companyResearchSystemPrompt,
		messages: [{ role: 'user', content: briefFor(query, website.pages) }],
		tools: [companyResearchTool],
		forcedToolName: companyResearchTool.name,
		maxTokens: longestProfileTokens
	});
	const toolInput = toolUseFrom(response, companyResearchTool.name);
	if (toolInput === undefined) throw new Error('Claude did not return a profile');
	const profile = parseResearchedProfile(toolInput as Record<string, unknown>, website.url, website.url);
	return { kind: 'researched', profile: withFallbackName(profile, query) };
}

function briefFor(query: string, pages: PublicPage[]): string {
	const pageBlocks = pages.map((page) => `=== ${page.url} ===\n${page.text}`);
	return [`Research "${query}" from these pages.`, ...pageBlocks].join('\n\n');
}

function withFallbackName(profile: ResearchedProfile, query: string): ResearchedProfile {
	if (profile.name !== '') return profile;
	return { ...profile, name: query };
}
