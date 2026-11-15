import { FilmMakingKinds, firstShotNumber, isFilmMakingOpen, type FilmMaking, type FilmMakingKind } from './filmMaking';
import { isMusic, isVideo } from '../library/libraryItem';
import { problemWithDraftItems } from '../content/checkDraftItems';
import type { ContentPiece } from '../content/contentPiece';
import type { ItemStanding } from '../library/choosableItem';

const imageFamily = 'image';

/** Whether the medium is one of the image family: a post's picture, a story or a carousel, made one picture a shot. */
export function isImageMediumPath(mediumPath: string): boolean {
	return mediumPath === imageFamily || mediumPath.startsWith(`${imageFamily}.`);
}

/** What a piece is made into: an image piece one picture a shot, anything else its video. */
export function makingKindOf(mediumPath: string): FilmMakingKind {
	return isImageMediumPath(mediumPath) ? FilmMakingKinds.pictures : FilmMakingKinds.video;
}

function problemWithShotPicture(shotIndex: number, item: ItemStanding | undefined): string | null {
	const shotName = `Shot ${shotIndex + firstShotNumber}`;
	if (item === undefined) return `${shotName} has no picture; give it the clipItemId of a photo from the library`;
	const isPhoto = !isVideo(item) && !isMusic(item);
	if (!isPhoto) return `${shotName}: ${item.filename} is not a photo, and a picture is made from a photo`;
	return null;
}

/** Why the piece cannot be made into its pictures now, or null: an image piece whose every shot carries a photo that may go out, none being made. */
export function problemWithMakingPictures(piece: ContentPiece, items: Map<string, ItemStanding>, latest: FilmMaking | null): string | null {
	if (!isImageMediumPath(piece.mediumPath)) return `“${piece.title}” is not a picture post, story or carousel`;
	const { storyboard } = piece;
	if (storyboard.length === 0) return `“${piece.title}” has no shots yet; give it one shot a picture with draft_content`;
	const shotProblems = storyboard.map((shot, index) => problemWithShotPicture(index, shot.clipItemId === null ? undefined : items.get(shot.clipItemId)));
	const shotProblem = shotProblems.find((problem) => problem !== null);
	if (shotProblem !== undefined) return shotProblem;
	const itemProblem = problemWithDraftItems(piece, items);
	if (itemProblem !== null) return itemProblem;
	if (isFilmMakingOpen(latest)) return `“${piece.title}” is already being made; its pictures show on the piece when they are ready`;
	return null;
}
