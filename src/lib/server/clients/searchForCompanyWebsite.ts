import { companyWebsiteSearchBrief } from './companyWebsiteSearchBrief';
import { officialWebsiteCandidates } from './officialWebsite';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { textFrom } from '$lib/server/anthropic/anthropicTypes';
import { webSearchTool } from '$lib/server/anthropic/webSearchTool';
import type { CompanyIdentity } from './companyIdentity';

const mostSearches = 3;
const longestAnswerTokens = 1024;

const companyWebsiteSearchSystemPrompt = `You find the official website of a UK company for
Your Business Today, so that staff can read what the company says about itself.

Search the open web for the company's own website: the domain the company itself owns and
publishes. Use the Companies House number and registered address, when given, to tell it
apart from companies with similar names. A LinkedIn, Facebook, X or Instagram page, a
Companies House record, or a directory, review or listings site is never the company's own
website. Answer with the full address of its homepage, starting https://, on a line of its
own, or with the word NONE if you cannot find one you are sure belongs to this company.`;

export async function searchForCompanyWebsite(company: CompanyIdentity): Promise<string[]> {
	const response = await requestAnthropic({
		system: companyWebsiteSearchSystemPrompt,
		messages: [{ role: 'user', content: companyWebsiteSearchBrief(company) }],
		tools: [webSearchTool(mostSearches)],
		maxTokens: longestAnswerTokens
	});
	return officialWebsiteCandidates(textFrom(response));
}
