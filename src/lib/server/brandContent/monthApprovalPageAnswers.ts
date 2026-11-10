import { fail } from '@sveltejs/kit';
import { describeApprovalGiven } from '$lib/brand/approval/monthApprovalWords';
import { MonthApprovalKinds, type MonthApprovalOutcome } from '$lib/brand/approval/monthApproval';

const BadRequest = 400;

/** The plan page's answer to a month's approval: a failure saying why nothing was approved, or what was. */
export function monthApprovalPageAnswerFor(outcome: MonthApprovalOutcome) {
	if (outcome.kind === MonthApprovalKinds.refused) return fail(BadRequest, { message: `Nothing was approved: ${outcome.problem}.` });
	return { message: describeApprovalGiven(outcome) };
}
