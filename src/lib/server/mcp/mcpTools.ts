import { actionRunTools } from './actionRunTools';
import { readActionToolName, writeActionToolName } from './actionToolNames';
import { describeAction, listActions } from './browseActions';
import { describeContext } from './describeContext';
import { outstandingTools } from './outstandingTool';
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

const browseTools: McpTool[] = [
	{
		name: 'get_current_context',
		title: 'Who you are here',
		description:
			'Start here. Says who the signed-in person is, whether they are staff or a client ' +
			'contact, and which areas of Your Business Today they can reach.',
		inputSchema: { type: 'object', properties: {}, additionalProperties: false },
		annotations: { readOnlyHint: true },
		run: async (caller) => describeContext(caller)
	},
	{
		name: 'list_actions',
		title: 'List everything you can do',
		description:
			'Every action this person may run, with a one-line summary each. Anything the site ' +
			'lets them do is here; one marked "writes" runs through ' +
			`${writeActionToolName}, any other through ${readActionToolName}. Call describe_action ` +
			'before running one you have not run before.',
		inputSchema: { type: 'object', properties: { area: areaField }, additionalProperties: false },
		annotations: { readOnlyHint: true },
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
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) => describeAction(caller, argumentValues)
	}
];

const everyTool: McpTool[] = [...browseTools, ...actionRunTools, ...outstandingTools, ...uploadBoxTools];

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
