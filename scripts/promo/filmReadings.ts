import type { FilmSettings, FilmingPage, FilmingWindow } from './filmCut.ts';

/** Draws one moment of the film on the page, as the recorder is about to photograph it. */
export async function drawFilmMoment(page: FilmingPage, seconds: number): Promise<void> {
	await page.evaluate((moment) => (globalThis as unknown as FilmingWindow).promoFilming?.frame(moment), seconds);
}

export async function filmLength(page: FilmingPage): Promise<number> {
	return page.evaluate(() => {
		const { promoFilming } = globalThis as unknown as FilmingWindow;
		return promoFilming?.durationSeconds ?? 0;
	}, null);
}

/** The size the page asks to be filmed at, or the settings' own when it names none. */
export async function filmSize(page: FilmingPage, settings: FilmSettings): Promise<{ width: number; height: number }> {
	const asked = await page.evaluate(() => {
		const { promoFilming } = globalThis as unknown as FilmingWindow;
		return { width: promoFilming?.width, height: promoFilming?.height };
	}, null);
	return { width: asked.width ?? settings.width, height: asked.height ?? settings.height };
}

export async function recordSoundtrack(page: FilmingPage): Promise<Buffer> {
	const base64 = await page.evaluate(() => (globalThis as unknown as FilmingWindow).promoFilming?.soundtrack() ?? '', null);
	return Buffer.from(base64, 'base64');
}
