import { chatDecisionStatuses, type ChatDecision } from './chatDecisionRules';

const comesFirst = -1;
const comesAfter = 1;

function latestMomentOf(decision: ChatDecision): string {
	return decision.closedAt ?? decision.createdAt;
}

function latestFirst(first: ChatDecision, second: ChatDecision): number {
	const firstMoment = latestMomentOf(first);
	const secondMoment = latestMomentOf(second);
	return secondMoment.localeCompare(firstMoment);
}

function openFirst(first: ChatDecision, second: ChatDecision): number {
	const isFirstOpen = first.status === chatDecisionStatuses.open;
	const isSecondOpen = second.status === chatDecisionStatuses.open;
	const isSameStanding = isFirstOpen === isSecondOpen;
	if (isSameStanding) return latestFirst(first, second);
	if (isFirstOpen) return comesFirst;
	return comesAfter;
}

/** The decisions with the open ones first, newest raised first, then the closed ones, latest closed first. */
export function decisionsOpenFirst<Decision extends ChatDecision>(decisions: Decision[]): Decision[] {
	return [...decisions].sort(openFirst);
}

/** How many of the decisions still wait on someone. */
export function openDecisionCount(decisions: ChatDecision[]): number {
	return decisions.filter((decision) => decision.status === chatDecisionStatuses.open).length;
}

/** The decisions raised from each message, so a message can show that a decision came from it. */
export function decisionsByMessage<Decision extends ChatDecision>(decisions: Decision[]): Map<string, Decision[]> {
	const byMessage = new Map<string, Decision[]>();
	for (const decision of decisions) byMessage.set(decision.messageId, [...(byMessage.get(decision.messageId) ?? []), decision]);
	return byMessage;
}
