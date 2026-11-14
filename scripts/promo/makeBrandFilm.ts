import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { drawFilmMoment, filmSize } from './filmReadings.ts';
import { openFilm, type FilmSettings } from './filmCut.ts';
import { joinShots, layShot, type FilmFrame } from './layFilm.ts';
import { shapeOfClip } from './measureClip.ts';
import type { FilmOrder, FilmOutcome } from '../../src/lib/brand/film/filmOrder.ts';

/**
 * Makes one brand film a client's piece asked for, on GitHub's runner (.github/workflows/make-brand-film.yml):
 *
 *   SITE_URL=https://www.yourbusiness.today CRON_SECRET=… node scripts/promo/makeBrandFilm.ts <film making id>
 *
 * It asks the site what to film, photographs only the words of each shot on a clear background, has ffmpeg lay them
 * over the footage and the music (so a phone's HEVC footage is filmed too), sends the MP4 to the brand's library and
 * tells the site that it arrived or why it was not made. Needs ffmpeg and Playwright's Chromium.
 */
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [filmMakingId = ''] = process.argv.slice(2);
const { env } = process;
const siteUrl = env.SITE_URL ?? 'https://www.yourbusiness.today';
const framesPerSecond = 30;
const longestReasonCharacters = 400;
const megabyte = 1024 * 1024;

async function knock(step: string, body?: FilmOutcome): Promise<Response> {
	const headers = { Authorization: `Bearer ${env.CRON_SECRET}`, 'Content-Type': 'application/json' };
	return fetch(`${siteUrl}/api/brand-film/${filmMakingId}/${step}`, { method: 'POST', headers, body: JSON.stringify(body ?? {}) });
}

async function photographWords(order: FilmOrder, shape: string, folder: string): Promise<{ frame: FilmFrame; wordsPaths: string[] }> {
	const browser = await chromium.launch();
	const settings: FilmSettings = { pageUrl: `${siteUrl}${order.filmPagePath}?shape=${shape}`, width: 1920, height: 1080, framesPerSecond, jpegQuality: 92 };
	const probe = await openFilm(browser, settings);
	Object.assign(settings, await filmSize(probe, settings));
	await probe.close();
	const page = await openFilm(browser, settings);
	const wordsPaths: string[] = [];
	let startSeconds = 0;
	for (const shot of order.shots) {
		const moment = startSeconds + shot.seconds / 2;
		await drawFilmMoment(page, moment);
		const wordsPath = join(folder, `words-${wordsPaths.length}.png`);
		await writeFile(wordsPath, await page.screenshot({ type: 'png', omitBackground: true }));
		wordsPaths.push(wordsPath);
		startSeconds += shot.seconds;
	}
	await browser.close();
	return { frame: { width: settings.width, height: settings.height, framesPerSecond }, wordsPaths };
}

async function makeFilm(order: FilmOrder, folder: string): Promise<Buffer> {
	const [firstShot] = order.shots;
	if (firstShot === undefined) throw new Error('the film has no shots of any length');
	const { frame, wordsPaths } = await photographWords(order, await shapeOfClip(firstShot.clipUrl), folder);
	const segmentPaths = order.shots.map((_, index) => join(folder, `shot-${index}.mp4`));
	for (const [index, shot] of order.shots.entries()) await layShot(shot, wordsPaths[index], frame, segmentPaths[index]);
	const filmPath = join(folder, 'film.mp4');
	const filmSeconds = order.shots.reduce((total, shot) => total + shot.seconds, 0);
	await joinShots(segmentPaths, order.musicUrl, filmSeconds, filmPath);
	return readFile(filmPath);
}

async function sendFilm(order: FilmOrder, film: Buffer): Promise<void> {
	const isTooLarge = film.byteLength > order.largestByteCount;
	const megabytes = Math.ceil(film.byteLength / megabyte);
	if (isTooLarge) throw new Error(`the video came to ${megabytes} MB, more than the library keeps`);
	const sent = await fetch(order.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: new Uint8Array(film) });
	if (!sent.ok) throw new Error(`the library refused the video (${sent.status})`);
}

function reasonOf(failure: unknown): string {
	const message = failure instanceof Error ? failure.message : String(failure);
	return message.length > longestReasonCharacters ? `${message.slice(0, longestReasonCharacters)}…` : message;
}

async function run(): Promise<void> {
	const asked = await knock('start');
	const answer = await asked.json();
	if (!asked.ok) return console.log(`::warning::Nothing to film: ${answer.problem ?? asked.status}`);
	const folder = await mkdtemp(join(tmpdir(), 'brand-film-'));
	const outcome: FilmOutcome = await makeFilm(answer, folder)
		.then((film) => sendFilm(answer, film))
		.then((): FilmOutcome => ({ hasArrived: true }))
		.catch((failure): FilmOutcome => ({ hasArrived: false, failureReason: reasonOf(failure) }));
	await rm(folder, { recursive: true, force: true });
	const told = await knock('finish', outcome);
	console.log(JSON.stringify(await told.json()));
	if (!told.ok) process.exitCode = 1;
}

await run();
