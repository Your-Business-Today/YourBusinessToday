import { approvePiecesOfMonth } from '$lib/server/brandContent/approvePiecesOfMonth';
import { checkContentIdea } from '$lib/brand/content/contentIdea';
import { checkMoment } from '$lib/brand/content/checkMoment';
import { checkPostKind } from '$lib/brand/postKinds/checkPostKind';
import { planMonthAsked } from '$lib/brand/plan/planMonth';
import { describeContentPlan } from './describeContentPlan';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { findPostKindsOnOffer } from '$lib/server/brandKits/findPostKindsOnOffer';
import { keepContentIdea } from '$lib/server/brandContent/keepContentIdea';
import { noBrandYet } from './brandKitWriteAnswers';
import { findContentPlan } from '$lib/server/brandContent/findContentPlan';
import { readText } from '../actionTypes';
import { replanContentPiece } from '$lib/server/brandContent/replanContentPiece';
import { monthApprovalAnswerOf, replanAnswers } from './brandContentPlanAnswers';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

/** One month of the brand's content, week by week, on the day each piece goes out. */
export async function readContentPlan(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = planMonthAsked(readText(input, 'month'));
	if ('problem' in check) return `${check.problem}.`;
	const plan = await findContentPlan(caller.supabase, organisation.id, check.month);
	return describeContentPlan(organisation.name, plan);
}

/** Writes an idea down for the day and time it goes out, before any script exists. */
export async function planContentIdea(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkContentIdea(input);
	if ('problem' in check) return `The idea was not planned: ${check.problem}. Nothing was kept.`;
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return noBrandYet(organisation);
	const { idea } = check;
	const { medium, title, plannedFor } = idea;
	const kindCheck = checkPostKind(input.kind, await findPostKindsOnOffer(caller.supabase, organisation.id, medium));
	if ('problem' in kindCheck) return `The idea was not planned: ${kindCheck.problem}. Nothing was kept.`;
	const { kind } = kindCheck;
	const contentPieceId = await keepContentIdea(caller.supabase, { organisationId: organisation.id, accountId: caller.accountId, idea, kind });
	return (
		`Planned the idea “${title}” (${kind}) for ${medium.label} on ${plannedFor} (id ${contentPieceId}). ` +
		'It is at idea; write it up with draft_content, giving this contentPieceId.'
	);
}

/** Moves a piece to another day; a scheduled piece's scheduled day moves with it. */
export async function moveContentToDay(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkMoment('plannedFor', input.plannedFor);
	if ('problem' in check) return `The piece was not moved: ${check.problem}. Nothing was changed.`;
	const piece = { organisationId: organisation.id, contentPieceId: readText(input, 'contentPieceId'), plannedFor: check.moment };
	const outcome = await replanContentPiece(caller.supabase, piece);
	return replanAnswers[outcome](check.moment);
}

/** Approves together the month's pieces the client was shown, each still as it was read; a change to one is asked for on its own. */
export async function approveContentMonth(caller: McpCaller, input: Input, organisation: Organisation) {
	const approver = { organisationId: organisation.id, authorId: caller.accountId };
	return monthApprovalAnswerOf(await approvePiecesOfMonth(caller.supabase, approver, input));
}
