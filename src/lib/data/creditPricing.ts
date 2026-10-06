import { creditValuePence } from './creditPacks';
import { rungFor } from './modelLadder';
import type { AnthropicUsage, MeteredCall } from './anthropicUsage';

export { creditValuePence };

export const creditsPerReply = 10;
export const creditsPerBrainQuestion = 10;
export const creditsPerBrainPrune = 25;
export const creditsPerBrainUnlearn = 50;
export const creditsPerInterviewReply = 10;
export const creditsPerTradeTalkQuestion = 25;
export const hiveMindEarningsPool = 12;

const ingestBaseCredits = 50;
const ingestBaseBytes = 25_000;
const ingestCreditsPerExtraBlock = 10;

/**
 * Model-priced work. A credit is valued at the cheapest pack rate
 * (creditPacks.ts) so the margin holds whichever pack the buyer chose;
 * costMarkup is the multiple of Anthropic's bill a job must return —
 * James's floor is "100% on top", 3× leaves room for Stripe fees and
 * refunded failures. Cache reads bill at a tenth of input, cache writes
 * at a quarter more, per Anthropic's published rates.
 */
export const usdToGbp = 0.74;
export const costMarkup = 3;
const cacheReadInputShare = 0.1;
const cacheWriteInputShare = 1.25;
const tokensPerMillion = 1_000_000;

/**
 * Dynamic pricing: costs scale with the work a job actually causes — bytes
 * read, brains updated, pages consulted — so every job clears its own
 * Claude usage with margin. Rates live here, spending goes through
 * spend_credits_for with the computed amount.
 */
export function ingestCreditsFor(byteCount: number): number {
	const extraBytes = Math.max(0, byteCount - ingestBaseBytes);
	return ingestBaseCredits + ingestCreditsPerExtraBlock * Math.ceil(extraBytes / ingestBaseBytes);
}

export function questionFloorCreditsFor(modelId: string): number {
	return rungFor(modelId).floorCredits;
}

export function usageCostPence(modelId: string, usage: AnthropicUsage): number {
	const rung = rungFor(modelId);
	const inputTokens =
		usage.inputTokens +
		usage.cacheReadTokens * cacheReadInputShare +
		usage.cacheWriteTokens * cacheWriteInputShare;
	const usd =
		(inputTokens / tokensPerMillion) * rung.inputUsdPerMillionTokens +
		(usage.outputTokens / tokensPerMillion) * rung.outputUsdPerMillionTokens;
	return usd * usdToGbp * 100;
}

// What a finished question owes: the tier floor, or the marked-up bill if
// that is higher — never less than the floor, so every call clears cost.
export function questionCreditsFor(calls: MeteredCall[]): number {
	if (calls.length === 0) return 0;
	const billPence = calls.reduce((total, call) => total + usageCostPence(call.modelId, call.usage), 0);
	const markedUp = Math.ceil((billPence * costMarkup) / creditValuePence);
	return Math.max(questionFloorCreditsFor(calls[0].modelId), markedUp);
}
