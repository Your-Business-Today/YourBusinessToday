import { McpErrorCode, McpRequestRefusal } from './mcpErrors';
import { ybtCommands } from './ybtCommands';

/** The prompt menu is the /ybt- commands: one prompt per command, named for it, which asks the person's Claude to do that one thing. */
export function describeMcpPrompts(): Record<string, unknown>[] {
	return ybtCommands.map(({ name, title, description }) => ({ name, title, description }));
}

export function getMcpPrompt(name: unknown): Record<string, unknown> {
	const command = ybtCommands.find((candidate) => candidate.name === name);
	if (command === undefined) {
		throw new McpRequestRefusal(McpErrorCode.InvalidParams, `No prompt is called ${String(name)}`);
	}
	const message = { role: 'user', content: { type: 'text', text: command.text } };
	return { description: command.description, messages: [message] };
}
