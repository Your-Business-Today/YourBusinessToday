import { parsePersonFindings, type PersonFindings } from './personFindings';
import { personFindingsSystemPrompt, personFindingsTool, personSearchSystemPrompt } from './personResearchPrompt';
import { personResearchBrief } from './personResearchBrief';
import { recordSearchFindings, searchTheWeb } from '$lib/server/anthropic/searchTheWeb';
import { webSearchTool } from '$lib/server/anthropic/webSearchTool';
import type { PersonCompany } from '../getCompaniesForPerson';
import type { PersonInFull } from '../getPerson';

const mostSearches = 5;
const longestReportTokens = 2500;
const longestFindingsTokens = 1500;

export async function researchPerson(person: PersonInFull, companies: PersonCompany[]): Promise<PersonFindings> {
	const searched = await searchTheWeb({
		system: personSearchSystemPrompt,
		brief: personResearchBrief(person, companies),
		search: webSearchTool(mostSearches),
		maxTokens: longestReportTokens
	});
	const toolInput = await recordSearchFindings(searched, {
		system: personFindingsSystemPrompt,
		tool: personFindingsTool,
		maxTokens: longestFindingsTokens
	});
	return parsePersonFindings(toolInput, searched.sources, person);
}
