import { ContentStages } from '../content/contentPiece';
import { LeftReasons, type LeftReason, type PieceAsShown, type PieceLeft } from './monthApproval';
import type { ContentPlan, PlanEntry } from '../plan/contentPlan';

/** The pieces a client was shown, split into those that stand as they were read and those left with their reason. */
export type AskedPiecesSorted = { toApprove: PlanEntry[]; left: PieceLeft[] };

/**
 * Holds each piece the client was shown against the month as it stands now: one not on the month's plan, no longer
 * awaiting approval, or changed since it was read is left as it is, never approved blind.
 */
export function sortAskedPieces(plan: ContentPlan, shown: PieceAsShown[]): AskedPiecesSorted {
	const entries = plan.weeks.flatMap((week) => week.days.flatMap((day) => day.entries));
	const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
	const sorted: AskedPiecesSorted = { toApprove: [], left: [] };
	for (const piece of shown) sortOne(sorted, piece, entriesById.get(piece.contentPieceId));
	return sorted;
}

function sortOne(sorted: AskedPiecesSorted, piece: PieceAsShown, entry: PlanEntry | undefined): void {
	if (entry === undefined) {
		sorted.left.push({ contentPieceId: piece.contentPieceId, title: null, medium: null, stage: null, reason: LeftReasons.notInMonth });
		return;
	}
	const reason = leftReasonOf(entry, piece);
	if (reason === null) {
		sorted.toApprove.push(entry);
		return;
	}
	sorted.left.push(pieceLeftOf(entry, reason));
}

function leftReasonOf(entry: PlanEntry, piece: PieceAsShown): LeftReason | null {
	if (entry.stage !== ContentStages.awaitingApproval) return LeftReasons.movedOn;
	const hasChangedSince = Date.parse(entry.updatedAt) !== Date.parse(piece.updatedAt);
	if (hasChangedSince) return LeftReasons.changedSince;
	return null;
}

/** A piece of the plan left as it was, for the named reason. */
export function pieceLeftOf(entry: PlanEntry, reason: LeftReason): PieceLeft {
	return { contentPieceId: entry.id, title: entry.title, medium: entry.medium, stage: entry.stage, reason };
}
