import { approvedAwaitingPictureCountOf, approvedPostCountOf, awaitingApprovalOf } from '$lib/brand/approval/awaitingApproval';
import { checkMonthApproval } from '$lib/brand/approval/checkMonthApproval';
import { findContentPlan } from './findContentPlan';
import { LeftReasons, MonthApprovalKinds, type MonthApprovalOutcome } from '$lib/brand/approval/monthApproval';
import { pieceLeftOf, sortAskedPieces } from '$lib/brand/approval/askedPieces';
import { ReviewVerdicts } from '$lib/brand/content/contentReview';
import { reviewContentPiece } from './reviewContentPiece';
import type { PlanEntry } from '$lib/brand/plan/contentPlan';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who approves the organisation's month: the person whose approval each piece keeps. */
export type MonthApprover = { organisationId: string; authorId: string };

const movedOnByReview = 'moved';

/**
 * Approves each piece of the month a client was shown that still stands as they read it, one at a time, each kept as a
 * review by the person who gave it through the one review step; a piece that cannot be approved is left as it was and
 * named, and never undoes the others. The plan page and the connector's approve_content_month both run it.
 */
export async function approvePiecesOfMonth(
	supabase: SupabaseClient,
	approver: MonthApprover,
	input: Record<string, unknown>
): Promise<MonthApprovalOutcome> {
	const check = checkMonthApproval(input);
	if ('problem' in check) return { kind: MonthApprovalKinds.refused, problem: check.problem };
	const { month, pieces } = check.asked;
	const plan = await findContentPlan(supabase, approver.organisationId, month);
	const { toApprove, left } = sortAskedPieces(plan, pieces);
	const review = { verdict: ReviewVerdicts.approved, body: `Approved with the plan for ${plan.monthLabel}.` };
	const approvedIds = new Set<string>();
	for (const entry of toApprove) {
		const isApproved = await approveOne(supabase, approver, entry, review);
		if (isApproved) {
			approvedIds.add(entry.id);
			continue;
		}
		left.push(pieceLeftOf(entry, LeftReasons.takenFirst));
	}
	const posts = awaitingApprovalOf(plan);
	const awaitingPictureCount = approvedAwaitingPictureCountOf(posts, approvedIds);
	const postCount = approvedPostCountOf(posts, approvedIds);
	return { kind: MonthApprovalKinds.given, monthLabel: plan.monthLabel, approvedCount: approvedIds.size, postCount, awaitingPictureCount, left };
}

type ApprovalReview = { verdict: string; body: string };

async function approveOne(supabase: SupabaseClient, approver: MonthApprover, entry: PlanEntry, review: ApprovalReview): Promise<boolean> {
	const reviewer = { ...approver, contentPieceId: entry.id };
	const outcome = await reviewContentPiece(supabase, reviewer, review);
	return outcome.kind === movedOnByReview;
}
