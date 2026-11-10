import { error } from '@sveltejs/kit';
import { pageAnswerFor } from '$lib/server/brandContent/contentReviewPageAnswers';
import { readContentPiecePage } from '$lib/server/brandContent/readContentPiecePage';
import { readPostPicturesPage } from '$lib/server/brandContent/readPostPicturesPage';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import { reviewContentPiece } from '$lib/server/brandContent/reviewContentPiece';
import type { Actions, PageServerLoad } from './$types';

const brandModule = 'brand';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await parent();
	const piece = await readContentPiecePage(locals.supabase, params.organisationId, params.contentPieceId);
	if (piece === null) error(404, 'This piece is not in the brand’s content');
	const pictures = await readPostPicturesPage(locals.supabase, params.organisationId, piece.postId);
	return { piece, pictures };
};

export const actions = {
	review: async ({ locals, params, request }) => {
		const { organisation, user } = await requireOrganisationModule(locals, params.organisationId, brandModule);
		const form = await request.formData();
		const input = { verdict: form.get('verdict') ?? '', body: form.get('body') ?? '' };
		const reviewer = { organisationId: organisation.id, contentPieceId: params.contentPieceId, authorId: user.id };
		return pageAnswerFor(await reviewContentPiece(locals.supabase, reviewer, input));
	}
} satisfies Actions;
