import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { drawFilmMoment, filmSize } from './filmReadings.ts';
import { openFilm, type FilmSettings } from './filmCut.ts';
import type { FilmFrame } from './layFilm.ts';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const framesPerSecond = 30;
const wideSize = { width: 1920, height: 1080 };

/** Where the words page is, and the moments of the film whose words are wanted. */
export type WordsAsked = { pageUrl: string; shape: string; moments: number[]; folder: string; name: string };

/**
 * Photographs only the words of the film at each moment, on a clear background, at the size the page asks for: the
 * runner lays them over footage and photos ffmpeg reads, which the browser itself might not play.
 */
export async function photographWords(asked: WordsAsked): Promise<{ frame: FilmFrame; wordsPaths: string[] }> {
	const browser = await chromium.launch();
	const settings: FilmSettings = { pageUrl: `${asked.pageUrl}?shape=${asked.shape}`, ...wideSize, framesPerSecond, jpegQuality: 92 };
	const probe = await openFilm(browser, settings);
	Object.assign(settings, await filmSize(probe, settings));
	await probe.close();
	const page = await openFilm(browser, settings);
	const wordsPaths: string[] = [];
	for (const moment of asked.moments) {
		await drawFilmMoment(page, moment);
		const wordsPath = join(asked.folder, `${asked.name}-${wordsPaths.length}.png`);
		await writeFile(wordsPath, await page.screenshot({ type: 'png', omitBackground: true }));
		wordsPaths.push(wordsPath);
	}
	await browser.close();
	return { frame: { width: settings.width, height: settings.height, framesPerSecond }, wordsPaths };
}
