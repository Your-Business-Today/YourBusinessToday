import * as answers from './brandKitWriteAnswers';
import { changeDecisionStatus, findBrandDecision, retireAdoptedAt } from '$lib/server/brandKits/brandDecisionStatus';
import { DecisionStatuses } from '$lib/brand/decisions/decision';
import { readText } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { BrandDecisionStanding } from '$lib/server/brandKits/brandDecisionStatus';
import type { McpCaller } from '../resolveMcpCaller';
import type { McpToolAnswer } from '../mcpContent';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const decisionIdFieldName = 'decisionId';
const formerlyAdoptedNote = ' Whatever was adopted there before is retired, and its row is kept.';

type DecisionFound = { decision: BrandDecisionStanding } | { answer: string };

/** Puts a proposed or retired decision in force, retiring the one it takes the place of. */
export async function adoptBrandDecision(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const found = await decisionOf(caller, input, organisation);
	if ('answer' in found) return found.answer;
	const { decision } = found;
	if (decision.status === DecisionStatuses.adopted) return answers.decisionAlready(decision);
	await retireAdoptedAt(caller.supabase, { organisationId: organisation.id, ...decision });
	const isChanged = await changeDecisionStatus(caller.supabase, decision, DecisionStatuses.adopted);
	if (!isChanged) return answers.adoptedMeanwhile;
	return answers.decisionMovedTo(decision, DecisionStatuses.adopted) + formerlyAdoptedNote;
}

/** Takes a decision out of force. Its row stays, with its id, so it can be adopted again. */
export async function retireBrandDecision(
	caller: McpCaller,
	input: Record<string, unknown>,
	organisation: Organisation
): Promise<McpToolAnswer> {
	const found = await decisionOf(caller, input, organisation);
	if ('answer' in found) return found.answer;
	const { decision } = found;
	if (decision.status === DecisionStatuses.retired) return answers.decisionAlready(decision);
	await changeDecisionStatus(caller.supabase, decision, DecisionStatuses.retired);
	return answers.decisionMovedTo(decision, DecisionStatuses.retired);
}

async function decisionOf(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<DecisionFound> {
	const decisionId = readText(input, decisionIdFieldName);
	const idRefusal = validateRecordId(decisionIdFieldName, decisionId);
	if (idRefusal !== null) return { answer: idRefusal };
	const decision = await findBrandDecision(caller.supabase, organisation.id, decisionId);
	if (decision === null) return { answer: answers.noSuchDecision };
	return { decision };
}
