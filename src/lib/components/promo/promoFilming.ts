/**
 * What the film recorder drives: draw any moment, and hand over the soundtrack as a WAV file in base64. A page that is
 * filmed at its own size says so; one that does not is filmed wide, at 1920 by 1080.
 */
export type PromoFilming = {
	durationSeconds: number;
	width?: number;
	height?: number;
	frame: (seconds: number) => Promise<void>;
	soundtrack: () => Promise<string>;
};

declare global {
	interface Window {
		promoFilming?: PromoFilming;
	}
}

/** Opens the film to the recorder in scripts/promo, which films it frame by frame; the returned call closes it. */
export function offerFilming(filming: PromoFilming): () => void {
	window.promoFilming = filming;
	return () => {
		window.promoFilming = undefined;
	};
}
