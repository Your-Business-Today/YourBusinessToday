import { jobAdvertBrief, jobAdvertFindingsSystemPrompt, jobAdvertFindingsTool, jobAdvertSearchSystemPrompt } from './jobAdvertPrompt';
import { jobBoardDomains } from './jobBoards';
import { parseJobAdverts, type CompanyJobAdverts } from './jobAdvert';
import { recordSearchFindings, searchTheWeb } from '$lib/server/anthropic/searchTheWeb';
import { webSearchTool } from '$lib/server/anthropic/webSearchTool';
import type { JobAdvertSubject } from './jobAdvertSubject';

const mostSearches = 5;
const longestReportTokens = 2000;
const longestFindingsTokens = 1500;

/** Reads a company's open adverts from the job boards on demand; nothing is stored. */
export async function findJobAdverts(subject: JobAdvertSubject): Promise<CompanyJobAdverts> {
	const { companyName } = subject;
	const searched = await searchTheWeb({
		system: jobAdvertSearchSystemPrompt,
		brief: jobAdvertBrief(companyName, subject.place),
		search: webSearchTool(mostSearches, jobBoardDomains),
		maxTokens: longestReportTokens
	});
	const toolInput = await recordSearchFindings(searched, {
		system: jobAdvertFindingsSystemPrompt,
		tool: jobAdvertFindingsTool,
		maxTokens: longestFindingsTokens
	});
	return { companyName, adverts: parseJobAdverts(toolInput, searched.sources) };
}
