import { isUuid } from '$lib/data/isUuid';
import { keepDraftOnIdea, type IdeaToWriteUp } from '$lib/server/brandContent/keepDraftOnIdea';
import { nothingChanged, stageOf } from './brandContentPieceMoves';
import { noSuchPiece } from './brandContentAnswers';
import { ContentMoves } from '$lib/brand/content/contentMoves';
import type { McpCaller } from '../resolveMcpCaller';

const { writeUpIdea: writeUpRule } = ContentMoves;

/** Writes a draft onto an idea already on the plan, so it keeps its day, or says why it cannot. */
export async function writeUpIdea(caller: McpCaller, idea: IdeaToWriteUp): Promise<string> {
	const { organisationId, contentPieceId, draft } = idea;
	const { medium, title } = draft;
	if (!isUuid(contentPieceId)) return noSuchPiece;
	const isWrittenUp = await keepDraftOnIdea(caller.supabase, idea);
	if (isWrittenUp) return `Wrote up the idea as “${title}” for ${medium.label} (id ${contentPieceId}). It is at drafted, on its planned day.`;
	const stage = await stageOf({ caller, organisationId, contentPieceId });
	if (stage === null) return noSuchPiece;
	return `${writeUpRule.refusal}, and this one is at ${stage}. ${nothingChanged}`;
}
