/** The ink a made film's words are drawn in: the caption colour, the accent the overline's dot takes, and the display face. */
export type FilmInk = { text: string; accent: string; font: string };

/** The kit's own ink, used where the brand gives none or gives one a recipe cannot carry. */
export const defaultFilmInk: FilmInk = { text: 'eef1f8', accent: 'ff4d5e', font: 'Space Grotesk' };

const LookVariables = { text: '--brand-colour-caption-text', accent: '--brand-colour-accent', font: '--brand-type-display-family' } as const;

const longHexPattern = /^#([0-9a-f]{6})$/i;
const shortHexPattern = /^#([0-9a-f]{3})$/i;
const familySeparator = ',';
const quotePattern = /["']/g;
const unsafeFontPattern = /[^A-Za-z0-9 -]/g;

/** A colour as ffmpeg takes it, six hex digits, or the fallback when the brand's value is not a hex colour. */
function hexOf(value: string | undefined, fallback: string): string {
	const given = (value ?? '').trim();
	const long = longHexPattern.exec(given);
	if (long !== null) return long[1].toLowerCase();
	const short = shortHexPattern.exec(given);
	if (short === null) return fallback;
	return [...short[1].toLowerCase()].map((digit) => digit + digit).join('');
}

/** The first family the brand names, kept to letters, digits, spaces and hyphens so it cannot break the recipe. */
function fontOf(value: string | undefined): string {
	const [firstFamily] = (value ?? '').split(familySeparator);
	const family = firstFamily.replace(quotePattern, '').replace(unsafeFontPattern, '').trim();
	return family === '' ? defaultFilmInk.font : family;
}

/** The brand's look as the ink its film is drawn in. */
export function filmInkOf(look: Record<string, string>): FilmInk {
	return {
		text: hexOf(look[LookVariables.text], defaultFilmInk.text),
		accent: hexOf(look[LookVariables.accent], defaultFilmInk.accent),
		font: fontOf(look[LookVariables.font])
	};
}
