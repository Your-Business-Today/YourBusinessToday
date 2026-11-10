import { checkMoment } from '../content/checkMoment';
import { checkPlanMonth } from '../plan/planMonth';
import { isUuid } from '$lib/data/isUuid';
import { PlanListing } from '../plan/contentPlan';
import type { MonthApprovalCheck, PieceAsShown } from './monthApproval';

type PieceCheck = { piece: PieceAsShown } | { problem: string };

const { mostPieces } = PlanListing;
const countsFromOne = 1;
const noPieces = 0;
const piecesExplained = 'pieces is a list of every piece you were shown, each with its contentPieceId and updatedAt';

/** The month and the pieces of it a client was shown, each checked, or the first reason the approval cannot be given. */
export function checkMonthApproval(input: Record<string, unknown>): MonthApprovalCheck {
	const monthCheck = checkPlanMonth(input.month);
	if ('problem' in monthCheck) return monthCheck;
	const given = input.pieces;
	if (!Array.isArray(given)) return { problem: piecesExplained };
	if (given.length === noPieces) return { problem: `pieces is empty: ${piecesExplained}` };
	if (given.length > mostPieces) return { problem: `pieces holds ${given.length}; approve at most ${mostPieces} at once` };
	const checks = given.map((piece, index) => checkPieceAsShown(piece, `pieces ${index + countsFromOne}`));
	const refusal = checks.find((check) => 'problem' in check);
	if (refusal !== undefined && 'problem' in refusal) return refusal;
	const pieces = checks.flatMap((check) => ('piece' in check ? [check.piece] : []));
	const twice = repeatedIdOf(pieces);
	if (twice !== null) return { problem: `pieces gives ${twice} twice; give each piece once` };
	return { asked: { month: monthCheck.month, pieces } };
}

function checkPieceAsShown(given: unknown, place: string): PieceCheck {
	const isObject = typeof given === 'object' && given !== null;
	if (!isObject) return { problem: `${place} is a piece with its contentPieceId and updatedAt` };
	const fields = given as Record<string, unknown>;
	const givenId = fields.contentPieceId;
	const contentPieceId = typeof givenId === 'string' ? givenId.trim() : '';
	if (!isUuid(contentPieceId)) return { problem: `${place}: contentPieceId is a piece’s id, as read_content_plan gives it` };
	const moment = checkMoment(`${place}: updatedAt`, fields.updatedAt);
	if ('problem' in moment) return moment;
	return { piece: { contentPieceId, updatedAt: moment.moment } };
}

function repeatedIdOf(pieces: PieceAsShown[]): string | null {
	const seen = new Set<string>();
	for (const { contentPieceId } of pieces) {
		if (seen.has(contentPieceId)) return contentPieceId;
		seen.add(contentPieceId);
	}
	return null;
}
