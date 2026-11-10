import contract from '../pipelineContract.json';
import { actionsFor } from '../actionRegistry';
import { answerMcpRequest } from '../mcpMethods';
import { breachesOf, reroutedActionsOf } from '../pipelineContractBreaches';
import type { ContractedAction, ContractedCall, OfferedCall } from '../pipelineContractBreaches';
import type { McpCaller } from '../resolveMcpCaller';
import type { McpRequest } from '../readMcpRequest';

const contractedTools: Record<string, ContractedCall> = contract.tools;
const contractedActions: Record<string, ContractedAction> = contract.actions;
const listToolsRequest: McpRequest = { id: 'self-check-tools', method: 'tools/list', params: {} };

type ListedTools = { result?: { tools?: OfferedCall[] } };

/**
 * Every promise in pipelineContract.json the deployed connector no longer keeps: the tools as
 * tools/list answers them, and the actions as they are offered to the person the check reads as.
 */
export async function liveContractBreaches(caller: McpCaller): Promise<string[]> {
	const offeredTools = await toolsListedFor(caller);
	const offeredActions = actionsFor(caller, null);
	return [
		...breachesOf(contractedTools, offeredTools),
		...breachesOf(contractedActions, offeredActions),
		...reroutedActionsOf(contractedActions, offeredActions)
	];
}

async function toolsListedFor(caller: McpCaller): Promise<OfferedCall[]> {
	const answer = (await answerMcpRequest(caller, listToolsRequest)) as ListedTools;
	const listing = answer.result;
	return listing?.tools ?? [];
}
