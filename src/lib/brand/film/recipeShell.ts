/** The pieces every recipe is written from: bash run as it stands in the user's Claude, quoting every value it is given. */
export const RecipeVideo = { framesPerSecond: 30, quality: 20, audioBitrate: '192k' } as const;

const ffmpegNeeded = 'ffmpeg (with drawtext) is needed: install it, for example with apt-get install -y ffmpeg, and run this again';
const unsafeExtensionPattern = /[^a-z0-9]/g;
const longestExtension = 5;

/** A value as one word of bash, whatever it holds. */
export function shellQuoted(text: string): string {
	return `'${text.replaceAll("'", `'\\''`)}'`;
}

/** The opening every recipe shares: stop at the first failure, ffmpeg present, and a folder of its own. */
export function recipeOpening(folder: string): string[] {
	return [
		'#!/usr/bin/env bash',
		'set -euo pipefail',
		`command -v ffmpeg >/dev/null || { echo ${shellQuoted(ffmpegNeeded)} >&2; exit 1; }`,
		`mkdir -p ${folder}`,
		`cd ${folder}`
	];
}

/** The name a fetched library file is saved under: the stem given, with the file's own extension so ffmpeg reads it rightly. */
export function savedNameOf(stem: string, filename: string): string {
	const extension = (filename.split('.').pop() ?? '').toLowerCase().replace(unsafeExtensionPattern, '').slice(0, longestExtension);
	const hasExtension = extension !== '' && filename.includes('.');
	return hasExtension ? `${stem}.${extension}` : stem;
}

export function fetchLine(url: string, savedName: string): string {
	return `curl -sSfL -o ${savedName} ${shellQuoted(url)}`;
}

export function writeTextLine(path: string, text: string): string {
	return `printf '%s' ${shellQuoted(text)} > ${path}`;
}

/** ffmpeg, quietly, never asking, overwriting what it made before. */
export function ffmpegLine(argumentsGiven: string[]): string {
	return ['ffmpeg -nostdin -y -loglevel error', ...argumentsGiven].join(' ');
}

/** Sends a made file to its granted library link, refusing first one larger than the library keeps. */
export function sendLines(path: string, upload: { url: string; mimeType: string; largestByteCount: number }): string[] {
	const tooLarge = `${path} is larger than the library's ${upload.largestByteCount} bytes`;
	return [
		`if [ "$(wc -c < ${path})" -gt ${upload.largestByteCount} ]; then echo ${shellQuoted(tooLarge)} >&2; exit 1; fi`,
		`curl -sSf -X PUT -H ${shellQuoted(`Content-Type: ${upload.mimeType}`)} --data-binary @${path} ${shellQuoted(upload.url)} >/dev/null`
	];
}
