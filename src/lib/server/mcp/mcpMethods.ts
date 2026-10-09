import { toolResultOf, type McpToolAnswer } from './mcpContent';
import { McpErrorCode, McpRequestRefusal, jsonRpcVersion, mcpFailure } from './mcpErrors';
import { describeMcpResources, readMcpResource } from './mcpResources';
import { describeMcpTools, findMcpTool } from './mcpTools';
import { toolFailureSentence } from './toolFailureSentence';
import {
	latestProtocolVersion,
	listCacheHints,
	negotiateProtocolVersion,
	serverInformation,
	supportedProtocolVersions
} from './mcpProtocol';
import type { McpCaller } from './resolveMcpCaller';
import type { McpRequest } from './readMcpRequest';

type McpAnswer = Record<string, unknown>;
type McpMethod = (caller: McpCaller, request: McpRequest) => Promise<McpAnswer>;

const capabilities = { tools: { listChanged: false }, resources: { listChanged: false } };

const methods: Record<string, McpMethod> = {
	'server/discover': async () => discovery(),
	ping: async () => ({}),
	initialize: async (_caller, request) => {
		const { params } = request;
		return {
			protocolVersion: negotiateProtocolVersion(params.protocolVersion),
			capabilities,
			serverInfo: serverInformation
		};
	},
	'tools/list': async () => ({ tools: describeMcpTools(), ...listCacheHints }),
	'tools/call': (caller, request) => callTool(caller, request),
	'resources/list': async () => ({ resources: describeMcpResources(), ...listCacheHints }),
	'resources/templates/list': async () => ({ resourceTemplates: [], ...listCacheHints }),
	'resources/read': async (_caller, request) => {
		const { uri } = request.params;
		return { ...readMcpResource(uri), ...listCacheHints };
	}
};

export async function answerMcpRequest(caller: McpCaller, request: McpRequest) {
	const method = methodNamed(request.method);
	if (method === null) {
		return mcpFailure(request.id, McpErrorCode.MethodNotFound, `Unknown method ${request.method}`);
	}
	try {
		const result = await method(caller, request);
		return { jsonrpc: jsonRpcVersion, id: request.id, result: { resultType: 'complete', ...result } };
	} catch (failure) {
		if (failure instanceof McpRequestRefusal) return mcpFailure(request.id, failure.code, failure.message);
		throw failure;
	}
}

/** Only a method declared above: a name every object inherits, such as constructor, is not one. */
function methodNamed(name: string): McpMethod | null {
	if (!Object.hasOwn(methods, name)) return null;
	return methods[name];
}

function discovery(): McpAnswer {
	return {
		protocolVersions: supportedProtocolVersions,
		latestProtocolVersion,
		capabilities,
		serverInfo: serverInformation
	};
}

async function callTool(caller: McpCaller, request: McpRequest): Promise<McpAnswer> {
	const { params } = request;
	const tool = findMcpTool(params.name);
	if (tool === null) {
		return toolAnswer(`There is no tool called ${String(params.name)}.`, true);
	}
	const argumentValues = (params.arguments ?? {}) as Record<string, unknown>;
	try {
		return toolAnswer(await tool.run(caller, argumentValues), false);
	} catch (failure) {
		console.error(`MCP tool ${tool.name} failed`, failure);
		return toolAnswer(toolFailureSentence(failure), true);
	}
}

function toolAnswer(answer: McpToolAnswer, isError: boolean): McpAnswer {
	return { ...toolResultOf(answer), isError };
}
