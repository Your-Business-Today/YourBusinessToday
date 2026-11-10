import { brandSnapshotOf } from '$lib/brand/projections/brandSnapshot';
import { captionRulesOf } from '$lib/brand/captions/captionRules';
import { checkPostKind, checkPostKindIfGiven } from '$lib/brand/postKinds/checkPostKind';
import { checkContentDraft } from '$lib/brand/content/checkContentDraft';
import { describeContentPiece, describeContentSummary } from './describeContentPiece';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findContentPieces } from '$lib/server/brandContent/findContentPieces';
import { findContentPost } from '$lib/server/brandContent/findContentPost';
import { isContentStage, contentStages } from '$lib/brand/content/contentPiece';
import { keepContentPiece } from '$lib/server/brandContent/keepContentPiece';
import { noBrandYet } from './brandKitWriteAnswers';
import { noSuchPiece } from './brandContentAnswers';
import { postKindsOnOfferOf } from '$lib/brand/postKinds/postKinds';
import { problemWithCaption } from '$lib/brand/captions/checkCaptionFitsChannel';
import { readText } from '../actionTypes';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';
import { writeUpIdea } from './brandContentIdeaDraft';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const stageRefusal = `stage is one of ${contentStages.join(', ')}, or left out for every piece.`;

/** Drafts a piece for one medium, checked against its columns, with a snapshot of the brand as it holds there. */
export async function draftContent(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const check = checkContentDraft(input);
	if ('problem' in check) return `The piece was not drafted: ${check.problem}. Nothing was kept.`;
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return noBrandYet(organisation);
	const { draft } = check;
	const { medium, title } = draft;
	const resolved = await resolveBrandKitFor(caller.supabase, organisation.id, medium);
	const ideaId = readText(input, 'contentPieceId');
	const isNewPiece = ideaId === '';
	const checkKind = isNewPiece ? checkPostKind : checkPostKindIfGiven;
	const kindCheck = checkKind(input.kind, postKindsOnOfferOf(resolved));
	if ('problem' in kindCheck) return `The piece was not drafted: ${kindCheck.problem}. Nothing was kept.`;
	const captionProblem = problemWithCaption(draft.caption, captionRulesOf(resolved));
	if (captionProblem !== null) return `The piece was not drafted: ${captionProblem}. Nothing was kept.`;
	const brandSnapshot = brandSnapshotOf(organisation.name, resolved);
	const piece = { organisationId: organisation.id, accountId: caller.accountId, draft, brandSnapshot, kind: kindCheck.kind };
	if (!isNewPiece) return writeUpIdea(caller, { ...piece, contentPieceId: ideaId });
	const contentPieceId = await keepContentPiece(caller.supabase, piece);
	return `Drafted “${title}” (${kindCheck.kind}) for ${medium.label} in ${organisation.name}’s brand (id ${contentPieceId}). It is at drafted.`;
}

/** The brand's pieces, newest first, or only those at one stage. */
export async function listContent(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const stage = readText(input, 'stage');
	const isEveryStage = stage === '';
	if (!isEveryStage && !isContentStage(stage)) return stageRefusal;
	const pieces = await findContentPieces(caller.supabase, organisation.id, isEveryStage ? null : stage);
	if (pieces.length === 0) return `${organisation.name}’s brand has no content${isEveryStage ? '' : ` at ${stage}`} yet.`;
	return pieces.map(describeContentSummary).join('\n');
}

/** One piece in full, with its snapshot of the brand, every review, and every channel of the post it is one of. */
export async function readContent(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const found = await findContentPiece(caller.supabase, organisation.id, readText(input, 'contentPieceId'));
	if (found === null) return noSuchPiece;
	const post = await findContentPost(caller.supabase, organisation.id, found.piece);
	return describeContentPiece(found, post);
}
