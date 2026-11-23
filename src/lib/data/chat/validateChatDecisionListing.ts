import { trimmedText } from '$lib/data/trimmedText';
import {
	chatDecisionLimits,
	chatDecisionListingRefusals,
	chatDecisionStatuses,
	type ChatDecisionListingAsked,
	type ChatDecisionStatus
} from './chatDecisionRules';

const statuses: unknown[] = Object.values(chatDecisionStatuses);
const fewestDecisionsListed = 1;
const everyRoom = '';

function isStatusAsked(status: unknown): boolean {
	if (status === undefined) return true;
	return statuses.includes(status);
}

function isLimitAsked(limit: unknown): boolean {
	if (limit === undefined) return true;
	if (!Number.isInteger(limit)) return false;
	const count = limit as number;
	return count >= fewestDecisionsListed && count <= chatDecisionLimits.latestDecisionsShown;
}

/** The room asked for, every one when none is named, whether it is open, closed or both, and how many at most; or why not. */
export function validateDecisionListing(input: Record<string, unknown>): ChatDecisionListingAsked | string {
	if (!isStatusAsked(input.status)) return chatDecisionListingRefusals.status;
	if (!isLimitAsked(input.limit)) return chatDecisionListingRefusals.limit;
	const roomId = trimmedText(input.roomId);
	const status = (input.status as ChatDecisionStatus | undefined) ?? null;
	const limit = (input.limit as number | undefined) ?? chatDecisionLimits.usualDecisionsListed;
	return { roomId: roomId === everyRoom ? null : roomId, status, limit };
}
