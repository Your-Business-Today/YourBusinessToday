import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FilmOrderShot } from '../../src/lib/brand/film/filmOrder.ts';

/** The frame a brand film is laid at, and its rate. */
export type FilmFrame = { width: number; height: number; framesPerSecond: number };

const videoQuality = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p'];
const audioQuality = ['-c:a', 'aac', '-b:a', '192k'];
const silence = ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'];

async function runFfmpeg(argumentsGiven: string[]): Promise<void> {
	const encoder = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...argumentsGiven], { stdio: 'inherit' });
	const [exitCode] = await once(encoder, 'close');
	if (exitCode !== 0) throw new Error(`ffmpeg stopped with code ${exitCode}`);
}

function clipInput(shot: FilmOrderShot, frame: FilmFrame): string[] {
	const seconds = String(shot.seconds);
	if (shot.isVideo) return ['-i', shot.clipUrl];
	return ['-loop', '1', '-framerate', String(frame.framesPerSecond), '-t', seconds, '-i', shot.clipUrl];
}

/** One shot as a segment: its clip fitted inside the frame, never stretched, held to its seconds, with its words laid over. */
export async function layShot(shot: FilmOrderShot, wordsPath: string, frame: FilmFrame, segmentPath: string): Promise<void> {
	const { width, height, framesPerSecond } = frame;
	const seconds = String(shot.seconds);
	const fitted =
		`[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,` +
		`setsar=1,fps=${framesPerSecond},tpad=stop_mode=clone:stop_duration=${seconds}[clip];[clip][1:v]overlay=0:0[shot]`;
	const inputs = [...clipInput(shot, frame), '-i', wordsPath];
	await runFfmpeg([...inputs, '-filter_complex', fitted, '-map', '[shot]', '-t', seconds, '-an', ...videoQuality, '-r', String(framesPerSecond), segmentPath]);
}

/** The shots joined in order with the music beneath, or silence when there is none, cut to the film's length. */
export async function joinShots(segmentPaths: string[], musicUrl: string | null, filmSeconds: number, outputPath: string): Promise<void> {
	const listPath = join(outputPath, '..', 'segments.txt');
	await writeFile(listPath, segmentPaths.map((segmentPath) => `file '${segmentPath}'`).join('\n'));
	const sound = musicUrl === null ? silence : ['-i', musicUrl];
	const length = String(filmSeconds);
	const inputs = ['-f', 'concat', '-safe', '0', '-i', listPath, ...sound];
	await runFfmpeg([...inputs, '-filter_complex', '[1:a]apad[sound]', '-map', '0:v', '-map', '[sound]', '-c:v', 'copy', ...audioQuality, '-t', length, '-movflags', '+faststart', outputPath]);
}
