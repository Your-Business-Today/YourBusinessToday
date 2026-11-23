import type { WhiteboardColour } from '$lib/data/chat/chatWhiteboardRules';

/** The theme colour each colour of the palette is drawn in, so the board keeps the site's own inks. */
export const whiteboardColourTokens: Record<WhiteboardColour, string> = {
	black: '--color-map-ink',
	red: '--color-tube-central',
	blue: '--color-tube-piccadilly',
	green: '--color-tube-district',
	amber: '--color-tube-bakerloo'
};

/** The swatch each colour shows in the toolbar. */
export const whiteboardSwatchClasses: Record<WhiteboardColour, string> = {
	black: 'bg-map-ink',
	red: 'bg-tube-central',
	blue: 'bg-tube-piccadilly',
	green: 'bg-tube-district',
	amber: 'bg-tube-bakerloo'
};

/** What each colour is called to someone who cannot see the swatch. */
export const whiteboardColourLabels: Record<WhiteboardColour, string> = {
	black: 'Black',
	red: 'Red',
	blue: 'Blue',
	green: 'Green',
	amber: 'Amber'
};

/** The paper the board is drawn on, light whatever the site's theme, so the picture posted reads the same everywhere. */
export const whiteboardPaperToken = '--color-map-paper';

/** The type the board writes text in. */
export const whiteboardFontToken = '--font-sans';
