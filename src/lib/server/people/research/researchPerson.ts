import { isPausedForSearch, webSearchSourcesFrom, type WebSearchSource } from '$lib/server/anthropic/webSearchResults';
import { parsePersonFindings, type PersonFindings } from './personFindings';
import { personFindingsSystemPrompt, personFindingsTool, personSearchSystemPrompt } from './personResearchPrompt';
import { personResearchBrief } from './personResearchBrief';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { textFrom, toolUseFrom, type AnthropicMessage, type AnthropicResponse } from '$lib/server/anthropic/anthropicTypes';
import { webSearchTool } from '$lib/server/anthropic/webSearchTool';
import type { PersonCompany } from '../getCompaniesForPerson';
import type { PersonInFull } from '../getPerson';

const mostSearches = 5;
const mostSearchRounds = 3;
const longestReportTokens = 2500;
const longestFindingsTokens = 1500;

export async function researchPerson(person: PersonInFull, companies: PersonCompany[]): Promise<PersonFindings> {
	const searched = await searchTheWeb(personResearchBrief(person, companies));
	const response = await requestAnthropic({
		system: personFindingsSystemPrompt,
		messages: [{ role: 'user', content: findingsBrief(searched.report, searched.sources) }],
		tools: [personFindingsTool],
		forcedToolName: personFindingsTool.name,
		maxTokens: longestFindingsTokens
	});
	const toolInput = toolUseFrom(response, personFindingsTool.name);
	if (toolInput === undefined) throw new Error('Claude did not record the findings');
	return parsePersonFindings(toolInput as Record<string, unknown>, searched.sources, person);
}

type SearchOutcome = { report: string; sources: WebSearchSource[] };

/** A long search can pause the turn; handing the content back lets it carry on. */
async function searchTheWeb(brief: string): Promise<SearchOutcome> {
	const messages: AnthropicMessage[] = [{ role: 'user', content: brief }];
	const sources: WebSearchSource[] = [];
	let report = '';
	for (let round = 0; round < mostSearchRounds; round += 1) {
		const response = await requestSearchRound(messages);
		sources.push(...webSearchSourcesFrom(response));
		report += textFrom(response);
		if (!isPausedForSearch(response)) break;
		messages.push({ role: 'assistant', content: response.content });
	}
	return { report, sources: uniqueByUrl(sources) };
}

function requestSearchRound(messages: AnthropicMessage[]): Promise<AnthropicResponse> {
	return requestAnthropic({
		system: personSearchSystemPrompt,
		messages,
		tools: [webSearchTool(mostSearches)],
		maxTokens: longestReportTokens
	});
}

function findingsBrief(report: string, sources: WebSearchSource[]): string {
	const pageLines = sources.map((source) => `- ${source.title}: ${source.url}`);
	return ['Report:', report, '', 'Pages read:', ...pageLines].join('\n');
}

function uniqueByUrl(sources: WebSearchSource[]): WebSearchSource[] {
	const byUrl = new Map(sources.map((source) => [source.url, source]));
	return [...byUrl.values()];
}
