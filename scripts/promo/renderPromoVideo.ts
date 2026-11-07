import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { filmCut, filmLength, openFilm, recordSoundtrack, type FilmCut, type FilmSettings } from './filmCut.ts';

/**
 * Films the /promo page into an MP4 with its soundtrack, frame by frame, so the video matches the page exactly.
 *
 *   npm run dev                       (in another terminal)
 *   node scripts/promo/renderPromoVideo.ts [output.mp4] [page url] [workers]
 *
 * Needs ffmpeg and Playwright's Chromium on the machine; it draws with SwiftShader, so no GPU is needed.
 */
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [outputArgument = 'ybt-promo.mp4', pageUrl = 'http://127.0.0.1:5173/promo?render', workersArgument = '2'] =
	process.argv.slice(2);
const settings: FilmSettings = { pageUrl, width: 1920, height: 1080, framesPerSecond: 30, jpegQuality: 92 };
const { env } = process;
const proxyServer = env.HTTPS_PROXY;
const browserOptions = {
	args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
	proxy: proxyServer ? { server: proxyServer, bypass: '127.0.0.1,localhost' } : undefined
};
const audioQuality = ['-c:a', 'aac', '-b:a', '192k'];

function planCuts(frameCount: number, workers: number, folder: string): FilmCut[] {
	const framesPerCut = Math.ceil(frameCount / workers);
	return Array.from({ length: workers }, (_, index) => {
		const firstFrame = index * framesPerCut;
		const segmentPath = join(folder, `segment-${index}.mp4`);
		return { firstFrame, frameCount: Math.min(framesPerCut, frameCount - firstFrame), segmentPath };
	});
}

async function joinCuts(cuts: FilmCut[], soundtrackPath: string, folder: string, outputPath: string): Promise<void> {
	const listPath = join(folder, 'segments.txt');
	await writeFile(listPath, cuts.map((cut) => `file '${cut.segmentPath}'`).join('\n'));
	const inputs = ['-f', 'concat', '-safe', '0', '-i', listPath, '-i', soundtrackPath];
	const joining = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-c:v', 'copy', ...audioQuality, '-shortest', '-movflags', '+faststart', outputPath], {
		stdio: 'inherit'
	});
	await once(joining, 'close');
}

async function filmInItsOwnBrowser(cut: FilmCut, report: () => void): Promise<void> {
	const browser = await chromium.launch(browserOptions);
	await filmCut(browser, settings, cut, report);
	await browser.close();
}

async function render(): Promise<void> {
	const outputPath = resolve(outputArgument);
	const folder = await mkdtemp(join(tmpdir(), 'promo-film-'));
	const browser = await chromium.launch(browserOptions);
	const soundtrackPage = await openFilm(browser, settings);
	const soundtrackPath = join(folder, 'soundtrack.wav');
	await writeFile(soundtrackPath, await recordSoundtrack(soundtrackPage));
	const frameCount = Math.round((await filmLength(soundtrackPage)) * settings.framesPerSecond);
	await soundtrackPage.close();
	await browser.close();
	const cuts = planCuts(frameCount, Number(workersArgument), folder);
	let framesFilmed = 0;
	const report = () => {
		framesFilmed += 1;
		const isWholeSecond = framesFilmed % settings.framesPerSecond === 0;
		if (isWholeSecond) console.log(`Filmed ${framesFilmed} of ${frameCount} frames`);
	};
	await Promise.all(cuts.map((cut) => filmInItsOwnBrowser(cut, report)));
	await joinCuts(cuts, soundtrackPath, folder, outputPath);
	await rm(folder, { recursive: true });
	console.log(`Wrote ${outputPath}`);
}

await render();
