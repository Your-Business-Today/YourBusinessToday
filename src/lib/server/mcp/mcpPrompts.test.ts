import { describe, expect, it } from 'vitest';
import { McpRequestRefusal } from './mcpErrors';
import { describeMcpPrompts, getMcpPrompt } from './mcpPrompts';
import { ybtCommands } from './ybtCommands';

function textOf(name: string): string {
	const { messages } = getMcpPrompt(name) as { messages: { content: { text: string } }[] };
	const [{ content }] = messages;
	return content.text;
}

describe('the connector’s prompts are the /ybt- commands', () => {
	it('offers one prompt per command, named for it, the chat first', () => {
		const prompts = describeMcpPrompts();
		expect(prompts.map((prompt) => prompt.name)).toEqual(ybtCommands.map((command) => command.name));
		const [first] = prompts;
		expect(first.name).toBe('ybt-chat');
		expect(first.title).toBe('YBT chat: what do I need to do?');
	});

	it('asks the Claude to run the summary as read_latest_messages and then the summary action, walked through', () => {
		expect(textOf('ybt-summary')).toContain('read_latest_messages');
		expect(textOf('ybt-summary')).toContain('read_ybt_summary');
		expect(textOf('ybt-summary')).toContain('quick decisions');
	});

	it('runs the turn-based chat through what_do_i_need_to_do and answer_turn, and what is outstanding through its tool', () => {
		expect(textOf('ybt-chat')).toContain('what_do_i_need_to_do');
		expect(textOf('ybt-chat')).toContain('answer_turn');
		expect(textOf('ybt-bugs')).toContain('bugsOnly true');
		expect(textOf('ybt-outstanding')).toContain('whats_outstanding_for_me');
		expect(textOf('ybt-chase')).toContain('who to chase');
	});

	it('refuses a prompt it does not have', () => {
		expect(() => getMcpPrompt('constructor')).toThrow(McpRequestRefusal);
		expect(() => getMcpPrompt('ybt_summary')).toThrow(McpRequestRefusal);
	});
});
