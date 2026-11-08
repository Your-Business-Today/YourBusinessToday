import { spawn } from 'node:child_process';
import { once } from 'node:events';

export type FilmSettings = { pageUrl: string; width: number; height: number; framesPerSecond: number; jpegQuality: number };

export type FilmCut = { firstFrame: number; frameCount: number; segmentPath: string };

type FilmingPage = {
	goto: (url: string, options: object) => Promise<unknown>;
	waitForFunction: (test: () => boolean, argument: null, options: object) => Promise<unknown>;
	evaluate: <Result, Argument>(run: (argument: Argument) => Result, argument: Argument) => Promise<Result>;
	screenshot: (options: object) => Promise<Buffer>;
	close: () => Promise<void>;
};

type FilmingBrowser = { newPage: (options: object) => Promise<FilmingPage> };

type Filming = { durationSeconds: number; frame: (seconds: number) => Promise<void>; soundtrack: () => Promise<string> };

type FilmingWindow = { promoFilming?: Filming };

type FilmCamera = { browser: FilmingBrowser; settings: FilmSettings; page: FilmingPage };

const loadTimeout = { timeout: 180000 };
const photographTimeout = { timeout: 30000 };
const drawingTimeoutMilliseconds = 30000;
const attemptsPerFrame = 3;
const segmentQuality = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p'];

/** Opens the page in filming mode and waits until the film has offered itself to the recorder. */
export async function openFilm(browser: FilmingBrowser, settings: FilmSettings): Promise<FilmingPage> {
	const page = await browser.newPage({ viewport: { width: settings.width, height: settings.height } });
	await page.goto(settings.pageUrl, { waitUntil: 'load', ...loadTimeout });
	await page.waitForFunction(() => (globalThis as unknown as FilmingWindow).promoFilming !== undefined, null, loadTimeout);
	return page;
}

export async function filmLength(page: FilmingPage): Promise<number> {
	return page.evaluate(() => {
		const { promoFilming } = globalThis as unknown as FilmingWindow;
		return promoFilming?.durationSeconds ?? 0;
	}, null);
}

export async function recordSoundtrack(page: FilmingPage): Promise<Buffer> {
	const base64 = await page.evaluate(() => (globalThis as unknown as FilmingWindow).promoFilming?.soundtrack() ?? '', null);
	return Buffer.from(base64, 'base64');
}

function startEncoder(settings: FilmSettings, segmentPath: string) {
	const rate = String(settings.framesPerSecond);
	const input = ['-f', 'image2pipe', '-framerate', rate, '-c:v', 'mjpeg', '-i', '-'];
	return spawn('ffmpeg', ['-y', '-loglevel', 'error', ...input, ...segmentQuality, '-r', rate, segmentPath], {
		stdio: ['pipe', 'inherit', 'inherit']
	});
}

function stoppedAnswering(milliseconds: number): Promise<never> {
	return new Promise((_, reject) => {
		const timer = setTimeout(() => reject(new Error(`The page stopped answering for ${milliseconds} ms`)), milliseconds);
		timer.unref();
	});
}

async function photographOnce(page: FilmingPage, settings: FilmSettings, seconds: number): Promise<Buffer> {
	const drawing = page.evaluate((moment) => (globalThis as unknown as FilmingWindow).promoFilming?.frame(moment), seconds);
	await Promise.race([drawing, stoppedAnswering(drawingTimeoutMilliseconds)]);
	return page.screenshot({ type: 'jpeg', quality: settings.jpegQuality, ...photographTimeout });
}

/** Photographs one moment, on a fresh page if the old one stops answering, as headless Chromium now and then does. */
async function photographMoment(camera: FilmCamera, seconds: number, attemptsLeft = attemptsPerFrame): Promise<Buffer> {
	try {
		return await photographOnce(camera.page, camera.settings, seconds);
	} catch (error) {
		const isLastAttempt = attemptsLeft === 1;
		if (isLastAttempt) throw error;
		camera.page = await openFilm(camera.browser, camera.settings);
		return photographMoment(camera, seconds, attemptsLeft - 1);
	}
}

/** Films one run of frames into a video segment: each frame drawn at its exact moment, then photographed. */
export async function filmCut(browser: FilmingBrowser, settings: FilmSettings, cut: FilmCut, report: (frame: number) => void): Promise<void> {
	const camera = { browser, settings, page: await openFilm(browser, settings) };
	const encoder = startEncoder(settings, cut.segmentPath);
	const { stdin } = encoder;
	for (let frame = cut.firstFrame; frame < cut.firstFrame + cut.frameCount; frame += 1) {
		const photograph = await photographMoment(camera, frame / settings.framesPerSecond);
		const isFull = !stdin.write(photograph);
		if (isFull) await once(stdin, 'drain');
		report(frame);
	}
	stdin.end();
	await once(encoder, 'close');
}
