import type { ContentMove } from '$lib/brand/content/contentMoves';

/** A brand with one piece, held in memory, for the tests of the steps a piece takes. */
export const flowWorld = {
	switchedOn: ['brand'] as string[],
	stage: 'drafted' as string | null,
	moves: [] as ContentMove[],
	reviews: [] as unknown[]
};

export function resetFlowWorld(stage: string | null) {
	Object.assign(flowWorld, { switchedOn: ['brand'], stage, moves: [], reviews: [] });
}

export async function movePieceInWorld(_supabase: unknown, _organisationId: string, _id: string, move: ContentMove) {
	const { rule } = move;
	const { stage } = flowWorld;
	const canMove = stage !== null && (rule.from as string[]).includes(stage);
	if (!canMove) return false;
	flowWorld.stage = rule.to;
	flowWorld.moves.push(move);
	return true;
}
