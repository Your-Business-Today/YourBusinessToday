import { drawnWordsOf } from './wordFilters';
import { fetchLine, ffmpegLine, recipeOpening, RecipeVideo, savedNameOf, sendLines, shellQuoted } from './recipeShell';
import { filmInkOf, type FilmInk } from './filmInk';
import { FilmShapes } from './filmFrame';
import type { FilmOrderShot, VideoOrder } from './filmOrder';

const videoType = 'video/mp4';
const filmFile = 'film.mp4';
const shotList = 'shots.txt';
const silence = '-f lavfi -i anullsrc=r=48000:cl=stereo';
const { framesPerSecond, quality, audioBitrate } = RecipeVideo;

/** The clip fitted inside the frame without cutting, held on its last frame to the shot's length, the shot's words over it. */
function shotFilterOf(order: VideoOrder, shot: FilmOrderShot, wordFilters: string[]): string {
	const { width, height } = FilmShapes[order.shape];
	const fitted = [
		`scale=${width}:${height}:force_original_aspect_ratio=decrease`,
		`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
		'setsar=1',
		`fps=${framesPerSecond}`,
		`tpad=stop_mode=clone:stop_duration=${shot.seconds}`
	];
	return [...fitted, ...wordFilters].join(',');
}

function shotLinesOf(order: VideoOrder, shot: FilmOrderShot, shotNumber: number, ink: FilmInk): string[] {
	const { clip, words } = shot;
	const clipName = savedNameOf(`clip${shotNumber}`, clip.filename);
	const drawn = drawnWordsOf(words, order.shape, ink, `words${shotNumber}`);
	const held = shot.isVideo ? '' : `-loop 1 -framerate ${framesPerSecond} -t ${shot.seconds} `;
	const filter = shellQuoted(shotFilterOf(order, shot, drawn.filters));
	const encode = `-t ${shot.seconds} -an -c:v libx264 -preset veryfast -crf ${quality} -pix_fmt yuv420p shot${shotNumber}.mp4`;
	return [fetchLine(clip.url, clipName), ...drawn.fileLines, ffmpegLine([`${held}-i ${clipName}`, `-vf ${filter}`, encode])];
}

/** The shots joined in order over the music, or over silence, cut to the film's length and ready to stream. */
function joinLinesOf(order: VideoOrder): string[] {
	const filmSeconds = order.shots.reduce((total, shot) => total + shot.seconds, 0);
	const listed = order.shots.map((_, index) => shellQuoted(`file 'shot${index + 1}.mp4'`)).join(' ');
	const { music } = order;
	const musicName = music === null ? null : savedNameOf('music', music.filename);
	const fetchMusic = music === null ? [] : [fetchLine(music.url, musicName as string)];
	const sound = musicName === null ? silence : `-i ${musicName}`;
	const mixed = `-map 0:v -map 1:a -af apad -t ${filmSeconds} -c:v copy -c:a aac -b:a ${audioBitrate} -movflags +faststart ${filmFile}`;
	return [...fetchMusic, `printf '%s\\n' ${listed} > ${shotList}`, ffmpegLine([`-f concat -safe 0 -i ${shotList}`, sound, mixed])];
}

/** The bash the user's Claude runs to make the video and send it to the brand's library. */
export function videoRecipeOf(order: VideoOrder, folder: string): string {
	const ink = filmInkOf(order.look);
	const shotLines = order.shots.flatMap((shot, index) => shotLinesOf(order, shot, index + 1, ink));
	const upload = { url: order.uploadUrl, mimeType: videoType, largestByteCount: order.largestByteCount };
	const done = 'echo "The video is in the library. Call record_content_made with hasArrived true."';
	return [...recipeOpening(folder), ...shotLines, ...joinLinesOf(order), ...sendLines(filmFile, upload), done].join('\n');
}
