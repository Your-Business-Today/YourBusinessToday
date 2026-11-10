import { awaitingApprovalOf, piecesShownOf } from '$lib/brand/approval/awaitingApproval';
import { findPostPictures } from './findPostPictures';
import { noPictures } from '$lib/brand/pictures/postPictures';
import { postPicturesPageOf } from '$lib/brand/projections/postPicturesPage';
import { signLibraryViewLinks, type ViewableLibraryItem } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { ContentPlan } from '$lib/brand/plan/contentPlan';
import type { MonthApprovalPage } from '$lib/brand/approval/monthApprovalPage';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The posts of the month waiting for approval, with what each says of its picture and every chosen item signed in one call. */
export async function readMonthApprovalPage(supabase: SupabaseClient, organisationId: string, plan: ContentPlan): Promise<MonthApprovalPage> {
	const posts = awaitingApprovalOf(plan);
	const found = await findPostPictures(supabase, organisationId, posts.map((post) => post.postId));
	const chosen = [...found.values()].flatMap((pictures) => pictures.chosen);
	const signed = await signLibraryViewLinks(supabase, chosen);
	const signedById = new Map(signed.map((item) => [item.id, item]));
	const rows = posts.map((post) => {
		const pictures = found.get(post.postId) ?? noPictures;
		const signedChosen = pictures.chosen.map((item): ViewableLibraryItem => signedById.get(item.id) ?? { ...item, viewUrl: null });
		return { ...post, pictures: postPicturesPageOf(pictures, signedChosen) };
	});
	return { posts: rows, pieces: piecesShownOf(posts) };
}
