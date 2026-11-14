import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makePictures } from './makePictures.ts';
import { makeVideo } from './makeVideo.ts';
import { OrderKinds, type FilmOrder, type FilmOutcome } from '../../src/lib/brand/film/filmOrder.ts';

/**
 * Makes what one of a client's pieces asked for, a video or its pictures, on GitHub's runner
 * (.github/workflows/make-brand-film.yml):
 *
 *   SITE_URL=https://www.yourbusiness.today CRON_SECRET=… node scripts/promo/makeBrandFilm.ts <film making id>
 *
 * It asks the site what to make, photographs only the words of each shot on a clear background, has ffmpeg lay them
 * over the footage, photos and music (so a phone's HEVC footage is filmed too), sends each file to the brand's library
 * and tells the site that everything arrived or why it was not made. Needs ffmpeg and Playwright's Chromium.
 */
const [filmMakingId = ''] = process.argv.slice(2);
const { env } = process;
const siteUrl = env.SITE_URL ?? 'https://www.yourbusiness.today';
const longestReasonCharacters = 400;

async function knock(step: string, body?: FilmOutcome): Promise<Response> {
	const headers = { Authorization: `Bearer ${env.CRON_SECRET}`, 'Content-Type': 'application/json' };
	return fetch(`${siteUrl}/api/brand-film/${filmMakingId}/${step}`, { method: 'POST', headers, body: JSON.stringify(body ?? {}) });
}

async function make(order: FilmOrder, folder: string): Promise<void> {
	const pageUrl = `${siteUrl}${order.filmPagePath}`;
	if (order.kind === OrderKinds.pictures) return makePictures(order, pageUrl, folder);
	return makeVideo(order, pageUrl, folder);
}

function reasonOf(failure: unknown): string {
	const message = failure instanceof Error ? failure.message : String(failure);
	const isLong = message.length > longestReasonCharacters;
	return isLong ? `${message.slice(0, longestReasonCharacters)}…` : message;
}

async function run(): Promise<void> {
	const asked = await knock('start');
	const answer = await asked.json();
	if (!asked.ok) return console.log(`::warning::Nothing to make: ${answer.problem ?? asked.status}`);
	const folder = await mkdtemp(join(tmpdir(), 'brand-film-'));
	const outcome: FilmOutcome = await make(answer, folder)
		.then((): FilmOutcome => ({ hasArrived: true }))
		.catch((failure): FilmOutcome => ({ hasArrived: false, failureReason: reasonOf(failure) }));
	await rm(folder, { recursive: true, force: true });
	const told = await knock('finish', outcome);
	console.log(JSON.stringify(await told.json()));
	if (!told.ok) process.exitCode = 1;
}

await run();
