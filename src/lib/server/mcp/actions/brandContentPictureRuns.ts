import { checkPictureNeed } from '$lib/brand/pictures/checkPictureNeed';
import { describePostsAwaitingPicture, pictureAnswers } from './brandContentPictureAnswers';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findContentPlan } from '$lib/server/brandContent/findContentPlan';
import { findContentPost } from '$lib/server/brandContent/findContentPost';
import { findItemStanding } from '$lib/server/brandLibrary/findItemStanding';
import { isUuid, validateRecordId } from '$lib/data/isUuid';
import { keepPictureNeed } from '$lib/server/brandContent/keepPictureNeed';
import { keepPostPicture } from '$lib/server/brandContent/keepPostPicture';
import { noSuchPiece } from './brandContentAnswers';
import { planMonthAsked } from '$lib/brand/plan/planMonth';
import { problemWithChoosingItem } from '$lib/brand/library/choosableItem';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

/** Says what picture a post needs and where it is expected from, once for every channel of the post. */
export async function sayPostPictureNeeded(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkPictureNeed(input);
	if ('problem' in check) return pictureAnswers.needNotKept(check.problem);
	const post = await findPostOfPiece(caller, organisation, readText(input, 'contentPieceId'));
	if (post === null) return noSuchPiece;
	await keepPictureNeed(caller.supabase, { organisationId: organisation.id, accountId: caller.accountId, post, need: check.need });
	return pictureAnswers.needKept(check.need, post);
}

/** Chooses a photo or video from the brand's library for a post; one the library's rule says may not go out is refused by name. */
export async function choosePostPicture(caller: McpCaller, input: Input, organisation: Organisation) {
	const itemId = readText(input, 'itemId');
	const idRefusal = validateRecordId('itemId', itemId);
	if (idRefusal !== null) return pictureAnswers.notChosen(idRefusal);
	const post = await findPostOfPiece(caller, organisation, readText(input, 'contentPieceId'));
	if (post === null) return noSuchPiece;
	const item = await findItemStanding(caller.supabase, organisation.id, itemId);
	if (item === null) return pictureAnswers.noSuchItem;
	const problem = problemWithChoosingItem(item);
	if (problem !== null) return pictureAnswers.notChosen(problem);
	const choosing = { organisationId: organisation.id, accountId: caller.accountId, post, libraryItemId: itemId };
	const outcome = await keepPostPicture(caller.supabase, choosing);
	return pictureAnswers[outcome](item.filename, post);
}

/** The posts of a month that still wait on a picture, each with what it needs. */
export async function listPostsAwaitingPicture(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = planMonthAsked(readText(input, 'month'));
	if ('problem' in check) return `${check.problem}.`;
	const plan = await findContentPlan(caller.supabase, organisation.id, check.month);
	return describePostsAwaitingPicture(organisation.name, plan);
}

async function findPostOfPiece(caller: McpCaller, organisation: Organisation, contentPieceId: string) {
	const found = isUuid(contentPieceId) ? await findContentPiece(caller.supabase, organisation.id, contentPieceId) : null;
	if (found === null) return null;
	return findContentPost(caller.supabase, organisation.id, found.piece);
}
