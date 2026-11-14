import { OrderKinds, type FilmOrder } from './filmOrder';
import { pictureRecipeOf } from './pictureRecipe';
import { videoRecipeOf } from './videoRecipe';

const folderStem = 'ybt-film-';
const folderIdLength = 8;

/** The folder a request's recipe works in, named for the request so two never share one. */
export function recipeFolderOf(filmMakingId: string): string {
	const shortId = filmMakingId.replace(/[^a-z0-9]/gi, '').slice(0, folderIdLength);
	return `${folderStem}${shortId}`;
}

/** The bash the user's Claude runs to make what the order asks for and send it to the brand's library. */
export function filmRecipeOf(order: FilmOrder, filmMakingId: string): string {
	const folder = recipeFolderOf(filmMakingId);
	if (order.kind === OrderKinds.pictures) return pictureRecipeOf(order, folder);
	return videoRecipeOf(order, folder);
}
