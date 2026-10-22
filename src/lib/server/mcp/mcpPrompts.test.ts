import { describe, expect, it } from 'vitest';
import { McpRequestRefusal } from './mcpErrors';
import { describeMcpPrompts, getMcpPrompt } from './mcpPrompts';

const summaryPromptName = 'ybt_summary';

describe('the connector’s prompts', () => {
	it('offers the YBT summary by name', () => {
		const names = describeMcpPrompts().map((prompt) => prompt.name);
		expect(names).toContain(summaryPromptName);
	});

	it('asks the Claude to run the summary action and walk the person through it', () => {
		const { messages } = getMcpPrompt(summaryPromptName) as { messages: { content: { text: string } }[] };
		const [{ content }] = messages;
		expect(content.text).toContain('read_ybt_summary');
		expect(content.text).toContain('quick decisions');
	});

	it('refuses a prompt it does not have', () => {
		expect(() => getMcpPrompt('constructor')).toThrow(McpRequestRefusal);
	});

	it('offers what is outstanding by its plain words, through the tool of the same question', () => {
		const titles = describeMcpPrompts().map((prompt) => prompt.title);
		expect(titles).toContain('What is outstanding for me');
		const { messages } = getMcpPrompt('whats_outstanding') as { messages: { content: { text: string } }[] };
		const [{ content }] = messages;
		expect(content.text).toContain('whats_outstanding_for_me');
	});
});
