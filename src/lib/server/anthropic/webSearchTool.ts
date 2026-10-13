import type { AnthropicServerTool } from './anthropicTypes';

export const webSearchToolName = 'web_search';

const webSearchToolType = 'web_search_20250305';
const unitedKingdom = 'GB';
const londonTimezone = 'Europe/London';
const everyDomain: string[] = [];

/** Given domains, the search reads only those sites and their subdomains. */
export function webSearchTool(mostSearches: number, allowedDomains: string[] = everyDomain): AnthropicServerTool {
	const tool: AnthropicServerTool = {
		type: webSearchToolType,
		name: webSearchToolName,
		max_uses: mostSearches,
		user_location: { type: 'approximate', country: unitedKingdom, timezone: londonTimezone }
	};
	if (allowedDomains.length === 0) return tool;
	return { ...tool, allowed_domains: allowedDomains };
}
