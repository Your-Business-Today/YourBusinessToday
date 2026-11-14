import type { ShotWordPlace } from '../content/contentPiece';

/** The three shapes a storyboard film is made in, in pixels, as the first shot's clip chooses. */
export const FilmShapes = {
	wide: { width: 1920, height: 1080 },
	square: { width: 1080, height: 1080 },
	tall: { width: 1080, height: 1920 }
} as const;

export type FilmShape = keyof typeof FilmShapes;

/** The room a shot's words take on the frame, in the frame's own pixels. */
export type WordBand = { x: number; y: number; width: number; height: number };

const wideFromRatio = 1.2;
const tallBelowRatio = 0.84;

/** The shape that suits a clip of this size: a square-ish clip makes a square film. */
export function filmShapeOf(width: number, height: number): FilmShape {
	const isMeasured = width > 0 && height > 0;
	if (!isMeasured) return 'wide';
	const ratio = width / height;
	if (ratio >= wideFromRatio) return 'wide';
	if (ratio < tallBelowRatio) return 'tall';
	return 'square';
}

/**
 * Where the words sit on each shape, stated once. The top bands are the 13 November kit's (120 in and 74 down, 1560
 * across on a wide frame; 64, 58 and 952 square; 72, 190 and 936 tall); the bottom bands mirror them and the left
 * bands run the frame's height inside the same margins.
 */
export const wordBands: Record<FilmShape, Record<ShotWordPlace, WordBand>> = {
	wide: {
		top: { x: 120, y: 74, width: 1560, height: 300 },
		bottom: { x: 120, y: 706, width: 1560, height: 300 },
		left: { x: 120, y: 74, width: 760, height: 932 }
	},
	square: {
		top: { x: 64, y: 58, width: 952, height: 300 },
		bottom: { x: 64, y: 722, width: 952, height: 300 },
		left: { x: 64, y: 58, width: 476, height: 964 }
	},
	tall: {
		top: { x: 72, y: 190, width: 936, height: 420 },
		bottom: { x: 72, y: 1310, width: 936, height: 420 },
		left: { x: 72, y: 190, width: 560, height: 1540 }
	}
};
