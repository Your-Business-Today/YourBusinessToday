import type { DemoBusiness } from '$lib/data/demo/demoBusiness';
import { textBlock } from '$lib/server/mcp/mcpContent';
import { McpErrorCode, jsonRpcVersion, mcpFailure } from '$lib/server/mcp/mcpErrors';
import {
	latestProtocolVersion,
	listCacheHints,
	negotiateProtocolVersion,
	supportedProtocolVersions
} from '$lib/server/mcp/mcpProtocol';
import { UnknownFieldError, refuseUnknownFields } from '$lib/server/mcp/unknownFieldRefusal';
import type { McpRequest } from '$lib/server/mcp/readMcpRequest';
import { describeDemoTools, findDemoTool } from './tools/demoTools';

/** One prospect's copy as a request sees it: what it holds today, and how to keep what a tool changed. */
export type DemoCopy = {
	business: DemoBusiness;
	today: string;
	save: (changed: DemoBusiness) => Promise<void>;
};

type McpAnswer = Record<string, unknown>;
type DemoMethod = (copy: DemoCopy, request: McpRequest) => Promise<McpAnswer>;

export const demoServerInformation = {
	name: 'your-business-today-demo',
	title: 'Your Business Today demo',
	version: '1.0.0'
} as const;

const capabilities = { tools: { listChanged: false } } as const;

const methods: Record<string, DemoMethod> = {
	'server/discover': async () => ({
		protocolVersions: supportedProtocolVersions,
		latestProtocolVersion,
		capabilities,
		serverInfo: demoServerInformation
	}),
	ping: async () => ({}),
	initialize: async (_copy, request) => {
		const { params } = request;
		return {
			protocolVersion: negotiateProtocolVersion(params.protocolVersion),
			capabilities,
			serverInfo: demoServerInformation
		};
	},
	'tools/list': async () => ({ tools: describeDemoTools(), ...listCacheHints }),
	'tools/call': (copy, request) => callTool(copy, request)
};

export async function answerDemoRequest(copy: DemoCopy, request: McpRequest) {
	const method = methodNamed(request.method);
	if (method === null) {
		return mcpFailure(request.id, McpErrorCode.MethodNotFound, `Unknown method ${request.method}`);
	}
	const result = await method(copy, request);
	return { jsonrpc: jsonRpcVersion, id: request.id, result };
}

function methodNamed(name: string): DemoMethod | null {
	if (!Object.hasOwn(methods, name)) return null;
	return methods[name];
}

async function callTool(copy: DemoCopy, request: McpRequest): Promise<McpAnswer> {
	const { params } = request;
	const toolName = String(params.name);
	const tool = findDemoTool(toolName);
	if (tool === null) {
		return toolAnswer(`There is no tool called ${toolName}.`, true);
	}
	const input = (params.arguments ?? {}) as Record<string, unknown>;
	try {
		refuseUnknownFields(tool.name, tool.inputSchema, input);
	} catch (failure) {
		if (failure instanceof UnknownFieldError) return toolAnswer(failure.message, true);
		throw failure;
	}
	const outcome = tool.run(copy.business, copy.today, input);
	if (outcome.changed !== undefined) await copy.save(outcome.changed);
	return toolAnswer(outcome.answer, false);
}

function toolAnswer(answer: string, isError: boolean): McpAnswer {
	return { content: [textBlock(answer)], isError };
}
