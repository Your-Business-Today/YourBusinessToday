import { json } from '@sveltejs/kit';
import { answerDemoRequest } from '$lib/server/demo/answerDemoRequest';
import { demoNotReadySentence, noSuchDemoSentence, openDemoCopy } from '$lib/server/demo/openDemoCopy';
import { McpErrorCode, mcpFailure } from '$lib/server/mcp/mcpErrors';
import { isNotification, readMcpRequest, type McpRequest } from '$lib/server/mcp/readMcpRequest';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { RequestHandler } from './$types';

const acknowledged = 202;
const notFound = 404;
const methodNotAllowed = 405;

export const POST: RequestHandler = async ({ request, params }) => {
	const payload = await request.json().catch(() => undefined);
	if (payload === undefined) {
		return json(mcpFailure(null, McpErrorCode.ParseError, 'The body is not JSON'));
	}
	const mcpRequest = readMcpRequest(payload);
	if (mcpRequest === null) {
		return json(mcpFailure(null, McpErrorCode.InvalidRequest, 'That is not a JSON-RPC request'));
	}
	if (isNotification(mcpRequest)) return new Response(null, { status: acknowledged });
	try {
		return await answer(params.token, mcpRequest);
	} catch (failure) {
		return json(failureAnswer(mcpRequest, failure));
	}
};

export const GET: RequestHandler = async () =>
	new Response('This endpoint only answers JSON-RPC over POST.', { status: methodNotAllowed });

async function answer(token: string, mcpRequest: McpRequest): Promise<Response> {
	const copy = await openDemoCopy(token);
	if (copy === null) return new Response(noSuchDemoSentence, { status: notFound });
	return json(await answerDemoRequest(copy, mcpRequest));
}

function failureAnswer(mcpRequest: McpRequest, failure: unknown) {
	if (isSchemaNotYetMigrated(failure)) {
		return mcpFailure(mcpRequest.id, McpErrorCode.InternalError, demoNotReadySentence);
	}
	console.error('Demo MCP request failed', failure);
	return mcpFailure(mcpRequest.id, McpErrorCode.InternalError, 'Something went wrong on our side. Try again shortly.');
}
