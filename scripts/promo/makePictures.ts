import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { layPicture } from './layFilm.ts';
import { photographWords } from './photographWords.ts';
import { sendToLibrary } from './sendToLibrary.ts';
import { shapeOfClip } from './measureClip.ts';
import type { PictureOrder } from '../../src/lib/brand/film/filmOrder.ts';

const pictureType = 'image/png';
const middleOfItsSecond = 0.5;

/** Makes each picture in shot order: its photo filling the frame its shape takes, its shot's words over it, sent to its link. */
export async function makePictures(order: PictureOrder, pageUrl: string, folder: string): Promise<void> {
	for (const [index, picture] of order.pictures.entries()) {
		const shape = await shapeOfClip(picture.clipUrl);
		const asked = { pageUrl, shape, moments: [index + middleOfItsSecond], folder, name: `words-${index}` };
		const { frame, wordsPaths } = await photographWords(asked);
		const picturePath = join(folder, `picture-${index}.png`);
		await layPicture(picture.clipUrl, wordsPaths[0], frame, picturePath);
		const delivery = { uploadUrl: picture.uploadUrl, mimeType: pictureType, largestByteCount: order.largestByteCount };
		await sendToLibrary(delivery, await readFile(picturePath));
	}
}
