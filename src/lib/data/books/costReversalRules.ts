import { formatBritishDate } from '$lib/data/britishDate';

/** The journals a cost posted: the one that recorded it, and the one that paid it once it is paid. */
export type CostJournals = { supplier: string; recordedJournalId: string | null; paymentJournalId: string | null };

/** A journal that reverses one of a cost's journals: its day, what it says, and which journal it reverses. */
export type CostReversal = { journalId: string; journalDate: string; description: string; reversedJournalId: string };

/** The ids of the journals a cost posted, leaving out the payment of a cost not yet paid. */
export function costJournalIds(cost: CostJournals): string[] {
	return [cost.recordedJournalId, cost.paymentJournalId].filter((journalId): journalId is string => journalId !== null);
}

/** Why a cost one of whose journals another journal reverses is not deleted, naming each reversal, or null when none does. */
export function reversedCostRefusal(cost: CostJournals, reversals: CostReversal[]): string | null {
	if (reversals.length === 0) return null;
	const named = reversals.map((reversal) => describeReversal(cost, reversal)).join('; ');
	return `The cost from ${cost.supplier} was reversed in the ledger: ${named}. It stays in the books as recorded and reversed.`;
}

function describeReversal(cost: CostJournals, reversal: CostReversal): string {
	const reversedPosting = reversal.reversedJournalId === cost.recordedJournalId ? 'its recording' : 'its payment';
	return `${reversedPosting} by the journal of ${formatBritishDate(reversal.journalDate)}, "${reversal.description}"`;
}
