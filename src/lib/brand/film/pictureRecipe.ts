import { drawnWordsOf } from './wordFilters';
import { fetchLine, ffmpegLine, recipeOpening, savedNameOf, sendLines, shellQuoted } from './recipeShell';
import { filmInkOf, type FilmInk } from './filmInk';
import { FilmShapes } from './filmFrame';
import type { PictureOrder, PictureOrderShot } from './filmOrder';

const pictureType = 'image/png';

/** The photo filling the frame, cut to it rather than stretched, the shot's words over it. */
function pictureFilterOf(order: PictureOrder, wordFilters: string[]): string {
	const { width, height } = FilmShapes[order.shape];
	const filled = [`scale=${width}:${height}:force_original_aspect_ratio=increase`, `crop=${width}:${height}`, 'setsar=1'];
	return [...filled, ...wordFilters].join(',');
}

function pictureLinesOf(order: PictureOrder, picture: PictureOrderShot, shotNumber: number, ink: FilmInk): string[] {
	const { photo, words } = picture;
	const photoName = savedNameOf(`photo${shotNumber}`, photo.filename);
	const pictureName = `picture${shotNumber}.png`;
	const drawn = drawnWordsOf(words, order.shape, ink, `words${shotNumber}`);
	const filter = shellQuoted(pictureFilterOf(order, drawn.filters));
	const upload = { url: picture.uploadUrl, mimeType: pictureType, largestByteCount: order.largestByteCount };
	const make = ffmpegLine([`-i ${photoName}`, `-vf ${filter}`, `-frames:v 1 ${pictureName}`]);
	return [fetchLine(photo.url, photoName), ...drawn.fileLines, make, ...sendLines(pictureName, upload)];
}

/** The bash the user's Claude runs to make every picture, in shot order, and send each to the brand's library. */
export function pictureRecipeOf(order: PictureOrder, folder: string): string {
	const ink = filmInkOf(order.look);
	const pictureLines = order.pictures.flatMap((picture, index) => pictureLinesOf(order, picture, index + 1, ink));
	const done = 'echo "The pictures are in the library. Call record_content_made with hasArrived true."';
	return [...recipeOpening(folder), ...pictureLines, done].join('\n');
}
