import { env } from '$env/dynamic/private';
import { anthropicMessagesUrl, anthropicVersion } from './anthropicConstants';
import { recordMeteredCall } from './modelContext';
import { resolveRequestModel } from './resolveRequestModel';
import type { AnthropicMessage, AnthropicRequestTool, AnthropicResponse } from './anthropicTypes';
import type { AnthropicUsage } from '$lib/data/anthropicUsage';

const failureDetailLimit = 300;

export type AnthropicRequest = {
	system: string;
	messages: AnthropicMessage[];
	tools: AnthropicRequestTool[];
	maxTokens: number;
	forcedToolName?: string;
	/** Makes the model reply through one of the tools rather than in prose. */
	mustUseTool?: boolean;
	/**
	 * Pins the model for callers that answer on someone else's behalf (a
	 * chatbot member's question runs on the bot's model, not the caller's).
	 */
	model?: string;
};

export async function requestAnthropic(request: AnthropicRequest): Promise<AnthropicResponse> {
	if ((env.ANTHROPIC_API_KEY ?? '') === '') {
		throw new Error('ANTHROPIC_API_KEY is not set — add it to .env');
	}
	const model = request.model ?? (await resolveRequestModel());
	const response = await fetch(anthropicMessagesUrl, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': env.ANTHROPIC_API_KEY ?? '',
			'anthropic-version': anthropicVersion
		},
		body: JSON.stringify({
			model,
			max_tokens: request.maxTokens,
			system: request.system,
			tools: request.tools,
			...toolChoiceFor(request),
			messages: request.messages
		})
	});
	if (!response.ok) throw await failureOf(response);
	const answer: AnthropicResponse = await response.json();
	recordMeteredCall({ modelId: model, usage: usageFrom(answer) });
	return answer;
}

function usageFrom(answer: AnthropicResponse): AnthropicUsage {
	const { usage } = answer;
	return {
		inputTokens: usage?.input_tokens ?? 0,
		outputTokens: usage?.output_tokens ?? 0,
		cacheReadTokens: usage?.cache_read_input_tokens ?? 0,
		cacheWriteTokens: usage?.cache_creation_input_tokens ?? 0
	};
}

async function failureOf(response: Response): Promise<Error> {
	const detail = (await response.text()).slice(0, failureDetailLimit);
	return new Error(`Anthropic request failed with status ${response.status}: ${detail}`);
}

function toolChoiceFor(request: AnthropicRequest): Record<string, unknown> {
	if (request.forcedToolName !== undefined) {
		return { tool_choice: { type: 'tool', name: request.forcedToolName } };
	}
	if (request.mustUseTool === true) return { tool_choice: { type: 'any' } };
	return {};
}
