import { brandSnapshotOf } from '$lib/brand/projections/brandSnapshot';
import { captionRulesOf } from '$lib/brand/captions/captionRules';
import { checkContentDraft } from '$lib/brand/content/checkContentDraft';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { findItemStandings } from '$lib/server/brandLibrary/findItemStandings';
import { libraryIdsOf, problemWithDraftItems } from '$lib/brand/content/checkDraftItems';
import { noBrandYet } from './brandKitWriteAnswers';
import { postKindsOnOfferOf, type PostKindsOnOffer } from '$lib/brand/postKinds/postKinds';
import { problemWithCaption } from '$lib/brand/captions/checkCaptionFitsChannel';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';
import type { ContentPieceToKeep } from '$lib/server/brandContent/keepContentPiece';
import type { GivenPostKindCheck } from '$lib/brand/postKinds/checkPostKind';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** How a draft's kind of post is checked: required of a new piece, kept unless given on one already kept. */
export type KindCheck = (given: unknown, offer: PostKindsOnOffer) => GivenPostKindCheck;

export type CheckedDraft = { piece: ContentPieceToKeep } | { refusal: string };

const notDrafted = (problem: string) => ({ refusal: `The piece was not drafted: ${problem}. Nothing was kept.` });

/** The draft checked against its columns, its kind and its caption, with the brand as it holds for its medium now. */
export async function checkDraftFor(
	caller: McpCaller,
	input: Record<string, unknown>,
	organisation: Organisation,
	checkKind: KindCheck
): Promise<CheckedDraft> {
	const check = checkContentDraft(input);
	if ('problem' in check) return notDrafted(check.problem);
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return { refusal: noBrandYet(organisation) };
	const { draft } = check;
	const items = await findItemStandings(caller.supabase, organisation.id, libraryIdsOf(draft));
	const itemsProblem = problemWithDraftItems(draft, items);
	if (itemsProblem !== null) return notDrafted(itemsProblem);
	const resolved = await resolveBrandKitFor(caller.supabase, organisation.id, draft.medium);
	const kindCheck = checkKind(input.kind, postKindsOnOfferOf(resolved));
	if ('problem' in kindCheck) return notDrafted(kindCheck.problem);
	const captionProblem = problemWithCaption(draft.caption, captionRulesOf(resolved));
	if (captionProblem !== null) return notDrafted(captionProblem);
	const brandSnapshot = brandSnapshotOf(organisation.name, resolved);
	return { piece: { organisationId: organisation.id, accountId: caller.accountId, draft, brandSnapshot, kind: kindCheck.kind } };
}
