export type AnthropicTextBlock = { type: 'text'; text: string };

export type AnthropicToolUseBlock = { type: 'tool_use'; id: string; name: string; input: unknown };

export type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock | { type: string };

export type AnthropicMessage = { role: 'user' | 'assistant'; content: unknown };

export type AnthropicTool = { name: string; description: string; input_schema: unknown };

/**
 * A tool Anthropic runs on its own servers, such as web search; the request
 * names it by type and the response carries its results as content blocks.
 */
export type AnthropicServerTool = {
	type: string;
	name: string;
	max_uses?: number;
	user_location?: { type: 'approximate'; country?: string; timezone?: string };
};

export type AnthropicRequestTool = AnthropicTool | AnthropicServerTool;

export type AnthropicUsageBlock = {
	input_tokens?: number;
	output_tokens?: number;
	cache_read_input_tokens?: number;
	cache_creation_input_tokens?: number;
};

export type AnthropicResponse = {
	model: string;
	content: AnthropicContentBlock[];
	stop_reason: string;
	usage?: AnthropicUsageBlock;
};

export function textFrom(response: AnthropicResponse): string {
	return response.content
		.filter((block): block is AnthropicTextBlock => block.type === 'text')
		.map((block) => block.text)
		.join('\n')
		.trim();
}

export function toolUseFrom(response: AnthropicResponse, toolName: string): unknown | undefined {
	const block = response.content.find(
		(candidate): candidate is AnthropicToolUseBlock =>
			candidate.type === 'tool_use' && (candidate as AnthropicToolUseBlock).name === toolName
	);
	return block?.input;
}
