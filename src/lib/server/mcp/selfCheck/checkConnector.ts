import { answerMcpRequest } from '../mcpMethods';
import { failureOfAnswer, failureOfThrow } from './callFailure';
import { liveContractBreaches } from './liveContractBreaches';
import { projectToReadFor, selfCheckCalls, type SelfCheckCall } from './selfCheckCalls';
import { resolveSelfCheckCaller, type McpCaller } from '../resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ConnectorCheck = { callsMade: number; failures: string[] };

const noAdministrator = 'There is no administrator to read as, so the connector could not be checked.';

/**
 * Checks the deployed connector against the live database: every promise of the pipeline contract
 * is still kept, and every call that only reads answers without an error. Nothing is written.
 */
export async function checkConnector(supabase: SupabaseClient): Promise<ConnectorCheck> {
	const caller = await resolveSelfCheckCaller(supabase);
	if (caller === null) return { callsMade: 0, failures: [noAdministrator] };
	const breaches = await liveContractBreaches(caller);
	const calls = selfCheckCalls(projectToReadFor(caller));
	const failures = await failuresOfCalls(caller, calls);
	return { callsMade: calls.length, failures: [...breaches, ...failures] };
}

async function failuresOfCalls(caller: McpCaller, calls: SelfCheckCall[]): Promise<string[]> {
	const failures: string[] = [];
	for (const call of calls) {
		const failure = await failureOfCall(caller, call);
		if (failure !== null) failures.push(failure);
	}
	return failures;
}

async function failureOfCall(caller: McpCaller, call: SelfCheckCall): Promise<string | null> {
	const request = { id: call.name, method: 'tools/call', params: { name: call.tool, arguments: call.arguments } };
	try {
		return failureOfAnswer(call.name, await answerMcpRequest(caller, request));
	} catch (failure) {
		return failureOfThrow(call.name, failure);
	}
}
