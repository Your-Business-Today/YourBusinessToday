import { adderOf, itemsByIdOf, type OrderParts, type PreparedOrder } from './orderPreparation';
import { filmPostingOf } from '$lib/brand/film/filmPosting';
import { firstShotNumber } from '$lib/brand/film/filmMaking';
import { grantLibraryUpload } from '$lib/server/brandLibrary/grantLibraryUpload';
import { isoDateOf } from '$lib/data/demo/demoDates';
import { keepPicturesMade } from './keepPicturesMade';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import { OrderKinds, type PictureOrderShot } from '$lib/brand/film/filmOrder';
import type { ViewableLibraryItem } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { SupabaseClient } from '@supabase/supabase-js';

const pictureType = 'image/png';

/** The picture a shot makes, as the library keeps it: named for the piece and the shot, posted on its photo's footing. */
function pictureItemOf(piece: ContentPiece, shotNumber: number, photo: ViewableLibraryItem) {
	const posting = filmPostingOf([photo]);
	if ('problem' in posting) return posting;
	const { title } = piece;
	const shows = `Picture ${shotNumber} of “${title}”, made from its shot.`;
	return { filename: `${title} ${shotNumber}.png`, mimeType: pictureType, byteCount: 0, shows, takenOn: isoDateOf(new Date()), ...posting };
}

/** The pictures' order: one library item granted a shot, in shot order, kept on the request, each with the photo it is made from. */
export async function preparePictureOrder(supabase: SupabaseClient, parts: OrderParts): Promise<PreparedOrder> {
	const { making, piece, items, filmPagePath } = parts;
	const itemsById = itemsByIdOf(items);
	const pictures: PictureOrderShot[] = [];
	const itemIds: string[] = [];
	for (const [index, shot] of piece.storyboard.entries()) {
		const photo = shot.clipItemId === null ? undefined : itemsById.get(shot.clipItemId);
		if (photo === undefined) return { problem: `a photo of “${piece.title}” could not be reached in the library` };
		const item = pictureItemOf(piece, index + firstShotNumber, photo);
		if ('problem' in item) return item;
		const grant = await grantLibraryUpload(supabase, adderOf(making), item);
		pictures.push({ clipUrl: photo.viewUrl as string, uploadUrl: grant.uploadUrl });
		itemIds.push(grant.itemId);
	}
	await keepPicturesMade(supabase, making, itemIds);
	const [firstItemId] = itemIds;
	const order = { kind: OrderKinds.pictures, filmPagePath, largestByteCount: LibraryLimits.largestByteCount, pictures };
	return { order, libraryItemId: firstItemId };
}
