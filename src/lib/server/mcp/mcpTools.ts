import { describeAction, listActions } from './browseActions';
import { describeContext } from './describeContext';
import { runAction } from './runAction';
import { uploadBoxTools } from './uploadBox/uploadBoxTools';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';

export type McpTool = {
	name: string;
	title: string;
	description: string;
	inputSchema: Record<string, unknown>;
	annotations?: Record<string, boolean>;
	meta?: Record<string, unknown>;
	run: (caller: McpCaller, argumentValues: Record<string, unknown>) => Promise<McpToolAnswer>;
};

const areaField = {
	type: 'string',
	description: 'Narrow to one area, as named by get_current_context'
};

const actionTools: McpTool[] = [
	{
		name: 'get_current_context',
		title: 'Who you are here',
		description:
			'Start here. Says who the signed-in person is, whether they are staff or a client ' +
			'contact, and which areas of Your Business Today they can reach.',
		inputSchema: { type: 'object', properties: {}, additionalProperties: false },
		run: async (caller) => describeContext(caller)
	},
	{
		name: 'list_actions',
		title: 'List everything you can do',
		description:
			'Every action this person may run, with a one-line summary each. Anything the site ' +
			'lets them do is here. Call describe_action before running one you have not run before.',
		inputSchema: { type: 'object', properties: { area: areaField }, additionalProperties: false },
		run: async (caller, argumentValues) => listActions(caller, argumentValues)
	},
	{
		name: 'describe_action',
		title: 'Read one action in full',
		description:
			'The input an action takes and any doctrine attached to it. Read this before running ' +
			'an action that writes.',
		inputSchema: {
			type: 'object',
			properties: { name: { type: 'string', description: 'The action name' } },
			required: ['name'],
			additionalProperties: false
		},
		run: async (caller, argumentValues) => describeAction(caller, argumentValues)
	},
	{
		name: 'perform_action',
		title: 'Run one action',
		description:
			'Run an action by name with its input. Writes are recorded under the signed-in ' +
			'person, exactly as if they had done it on the site.',
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'The action name' },
				input: { type: 'object', description: 'The action input, per describe_action' }
			},
			required: ['name'],
			additionalProperties: false
		},
		run: async (caller, argumentValues) =>
			runAction(
				caller,
				String(argumentValues.name ?? ''),
				(argumentValues.input ?? {}) as Record<string, unknown>
			)
	}
];

const everyTool: McpTool[] = [...actionTools, ...uploadBoxTools];

export function findMcpTool(name: unknown): McpTool | null {
	return everyTool.find((tool) => tool.name === name) ?? null;
}

export function describeMcpTools(): Record<string, unknown>[] {
	return everyTool.map((tool) => ({
		name: tool.name,
		title: tool.title,
		description: tool.description,
		inputSchema: tool.inputSchema,
		annotations: tool.annotations,
		_meta: tool.meta
	}));
}
