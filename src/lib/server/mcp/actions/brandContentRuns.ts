import { checkDraftFor } from './brandContentDraftChecks';
import { checkPostKind } from '$lib/brand/postKinds/checkPostKind';
import { describeContentPiece, describeContentSummary } from './describeContentPiece';
import { describeFilmStanding } from './describeFilmMaking';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findContentPieces } from '$lib/server/brandContent/findContentPieces';
import { findContentPost } from '$lib/server/brandContent/findContentPost';
import { findItemStandings } from '$lib/server/brandLibrary/findItemStandings';
import { findLatestFilmMaking } from '$lib/server/brandFilm/findFilmMakings';
import { findPostPictures } from '$lib/server/brandContent/findPostPictures';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import { isContentStage, contentStages } from '$lib/brand/content/contentPiece';
import { keepContentPiece } from '$lib/server/brandContent/keepContentPiece';
import { noSuchPiece } from './brandContentAnswers';
import { noPictures } from '$lib/brand/pictures/postPictures';
import { readText } from '../actionTypes';
import { redraftContent } from './brandContentRedraft';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const stageRefusal = `stage is one of ${contentStages.join(', ')}, or left out for every piece.`;

/** Drafts a new piece for one medium, or an idea or drafted piece again when its id is given, checked against its columns. */
export async function draftContent(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const contentPieceId = readText(input, 'contentPieceId');
	const isNewPiece = contentPieceId === '';
	if (!isNewPiece) return redraftContent(caller, input, organisation, contentPieceId);
	const checked = await checkDraftFor(caller, input, organisation, checkPostKind);
	if ('refusal' in checked) return checked.refusal;
	const { draft, kind } = checked.piece;
	const { medium, title } = draft;
	const keptId = await keepContentPiece(caller.supabase, checked.piece);
	return `Drafted “${title}” (${kind}) for ${medium.label} in ${organisation.name}’s brand (id ${keptId}). It is at drafted.`;
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

/** One piece in full, with its snapshot of the brand, every review, every channel of its post, its picture, its clips and its music. */
export async function readContent(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const found = await findContentPiece(caller.supabase, organisation.id, readText(input, 'contentPieceId'));
	if (found === null) return noSuchPiece;
	const { piece } = found;
	const post = await findContentPost(caller.supabase, organisation.id, piece);
	const pictures = await findPostPictures(caller.supabase, organisation.id, [post.id]);
	const library = await findItemStandings(caller.supabase, organisation.id, libraryIdsOf(piece));
	const latestFilm = await findLatestFilmMaking(caller.supabase, organisation.id, piece.id);
	const readings = { pictures: pictures.get(post.id) ?? noPictures, library, video: describeFilmStanding(latestFilm) };
	return describeContentPiece(found, post, readings);
}
