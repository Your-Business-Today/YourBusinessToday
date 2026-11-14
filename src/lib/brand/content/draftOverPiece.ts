import { ContentStages, type ContentPiece } from './contentPiece';

const draftFields = ['title', 'hook', 'script', 'storyboard', 'caption', 'invitedAction'] as const;

/**
 * The draft as asked for over a piece already kept: what is given takes the place of what is kept, and what is left out
 * stays. The kind is left as given, so a piece keeps its own kind unless another is asked for.
 */
export function draftOverPiece(piece: ContentPiece, input: Record<string, unknown>): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...input, medium: input.medium ?? piece.mediumPath };
	for (const field of draftFields) merged[field] = input[field] ?? piece[field];
	return merged;
}

/** Why the medium asked for cannot be taken, or null: a drafted piece keeps the medium it was drafted for. */
export function problemWithMediumChange(piece: ContentPiece, input: Record<string, unknown>): string | null {
	const isDrafted = piece.stage === ContentStages.drafted;
	const askedMedium = typeof input.medium === 'string' ? input.medium.trim() : '';
	const isSameMedium = askedMedium === '' || askedMedium === piece.mediumPath;
	if (!isDrafted || isSameMedium) return null;
	return `a drafted piece keeps its medium, ${piece.mediumPath}; draft a new piece for ${askedMedium}`;
}
