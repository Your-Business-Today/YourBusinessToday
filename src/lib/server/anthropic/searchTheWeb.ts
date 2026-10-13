import { isPausedForSearch, webSearchSourcesFrom, type WebSearchSource } from './webSearchResults';
import { requestAnthropic } from './requestAnthropic';
import { textFrom, toolUseFrom, type AnthropicMessage, type AnthropicServerTool, type AnthropicTool } from './anthropicTypes';

const mostSearchRounds = 3;

export type WebSearchOutcome = { report: string; sources: WebSearchSource[] };

export type WebSearchRequest = { system: string; brief: string; search: AnthropicServerTool; maxTokens: number };

export type FindingsRequest = { system: string; tool: AnthropicTool; maxTokens: number };

/** A long search can pause the turn; handing the content back lets it carry on. */
export async function searchTheWeb(request: WebSearchRequest): Promise<WebSearchOutcome> {
	const { system, search, maxTokens } = request;
	const messages: AnthropicMessage[] = [{ role: 'user', content: request.brief }];
	const sources: WebSearchSource[] = [];
	let report = '';
	for (let round = 0; round < mostSearchRounds; round += 1) {
		const response = await requestAnthropic({ system, messages, tools: [search], maxTokens });
		sources.push(...webSearchSourcesFrom(response));
		report += textFrom(response);
		if (!isPausedForSearch(response)) break;
		messages.push({ role: 'assistant', content: response.content });
	}
	return { report, sources: uniqueByUrl(sources) };
}

/** Turns a search report into what the findings tool records, listing the pages the search read. */
export async function recordSearchFindings(outcome: WebSearchOutcome, request: FindingsRequest): Promise<Record<string, unknown>> {
	const { tool } = request;
	const response = await requestAnthropic({
		system: request.system,
		messages: [{ role: 'user', content: reportWithPagesRead(outcome) }],
		tools: [tool],
		forcedToolName: tool.name,
		maxTokens: request.maxTokens
	});
	const toolInput = toolUseFrom(response, tool.name);
	if (toolInput === undefined) throw new Error('Claude did not record the findings');
	return toolInput as Record<string, unknown>;
}

function reportWithPagesRead(outcome: WebSearchOutcome): string {
	const pageLines = outcome.sources.map((source) => `- ${source.title}: ${source.url}`);
	return ['Report:', outcome.report, '', 'Pages read:', ...pageLines].join('\n');
}

function uniqueByUrl(sources: WebSearchSource[]): WebSearchSource[] {
	const byUrl = new Map(sources.map((source) => [source.url, source]));
	return [...byUrl.values()];
}
