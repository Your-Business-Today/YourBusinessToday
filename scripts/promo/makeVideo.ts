import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { joinShots, layShot } from './layFilm.ts';
import { photographWords } from './photographWords.ts';
import { sendToLibrary } from './sendToLibrary.ts';
import { shapeOfClip } from './measureClip.ts';
import type { VideoOrder } from '../../src/lib/brand/film/filmOrder.ts';

const videoType = 'video/mp4';

function middlesOf(order: VideoOrder): number[] {
	let startSeconds = 0;
	return order.shots.map((shot) => {
		const middle = startSeconds + shot.seconds / 2;
		startSeconds += shot.seconds;
		return middle;
	});
}

/** Makes the video: each shot's words over its clip, the shots joined over the music, sent to its link. */
export async function makeVideo(order: VideoOrder, pageUrl: string, folder: string): Promise<void> {
	const [firstShot] = order.shots;
	if (firstShot === undefined) throw new Error('the film has no shots of any length');
	const shape = await shapeOfClip(firstShot.clipUrl);
	const { frame, wordsPaths } = await photographWords({ pageUrl, shape, moments: middlesOf(order), folder, name: 'words' });
	const segmentPaths = order.shots.map((_, index) => join(folder, `shot-${index}.mp4`));
	for (const [index, shot] of order.shots.entries()) await layShot(shot, wordsPaths[index], frame, segmentPaths[index]);
	const filmPath = join(folder, 'film.mp4');
	const filmSeconds = order.shots.reduce((total, shot) => total + shot.seconds, 0);
	await joinShots(segmentPaths, order.musicUrl, filmSeconds, filmPath);
	const delivery = { uploadUrl: order.uploadUrl, mimeType: videoType, largestByteCount: order.largestByteCount };
	await sendToLibrary(delivery, await readFile(filmPath));
}
