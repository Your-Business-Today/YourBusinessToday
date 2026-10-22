import { McpErrorCode, McpRequestRefusal } from './mcpErrors';

/** A prompt the person picks from their Claude's menu, which asks their Claude to do one thing. */
type McpPrompt = { name: string; title: string; description: string; text: string };

const ybtSummaryPrompt: McpPrompt = {
	name: 'ybt_summary',
	title: 'YBT summary',
	description:
		'Everything assigned to you and waiting on you on Your Business Today, project by project: ' +
		'the quick decisions put to you first, then the bigger work.',
	text:
		'Give me my YBT summary. Run the read_ybt_summary action with perform_action and walk me ' +
		'through it as its answer says: every project with what is assigned to me and waiting on ' +
		'me, then the quick decisions one at a time, then the bigger work.'
};

const outstandingPrompt: McpPrompt = {
	name: 'whats_outstanding',
	title: 'What is outstanding for me',
	description:
		'Every action item that needs you on Your Business Today, and who to chase for what you are ' +
		'waiting on, person by person.',
	text:
		'What is outstanding for me? Run the whats_outstanding_for_me tool and walk me through it as ' +
		'its answer says: every action item I must do, then who to chase, then the quick decisions ' +
		'one at a time, then the bigger work.'
};

const everyPrompt: McpPrompt[] = [outstandingPrompt, ybtSummaryPrompt];

export function describeMcpPrompts(): Record<string, unknown>[] {
	return everyPrompt.map(({ name, title, description }) => ({ name, title, description }));
}

export function getMcpPrompt(name: unknown): Record<string, unknown> {
	const prompt = everyPrompt.find((candidate) => candidate.name === name);
	if (prompt === undefined) {
		throw new McpRequestRefusal(McpErrorCode.InvalidParams, `No prompt is called ${String(name)}`);
	}
	const message = { role: 'user', content: { type: 'text', text: prompt.text } };
	return { description: prompt.description, messages: [message] };
}
