export type BrandGlyph = { letter: string; outline: string; advance: number };

/** The wordmark's letters in Space Grotesk Bold, as the font draws them on a 1000-unit em. */
export const brandGlyphs: BrandGlyph[] = [
	{ letter: 'Y', advance: 624, outline: 'M246 0V241L8 700H155L303 400H321L469 700H616L378 241V0Z' },
	{
		letter: 'B',
		advance: 664,
		outline: [
			'M46 0V116H138V584H46V700H406Q470 700 517.5 678.5Q565 657 591.5 617.5Q618 578 618 523V513',
			'Q618 465 600 434.5Q582 404 557.5 387.5Q533 371 511 364V346Q533 340 559 323.5Q585 307 603.5 276',
			'Q622 245 622 195V185Q622 127 595 85.5Q568 44 520.5 22Q473 0 410 0Z',
			'M270 120H394Q437 120 463.5 141Q490 162 490 201V211Q490 250 464 271Q438 292 394 292H270Z',
			'M270 412H392Q433 412 459.5 433Q486 454 486 491V501Q486 539 460 559.5Q434 580 392 580H270Z'
		].join('')
	},
	{ letter: 'T', advance: 588, outline: 'M228 0V580H24V700H564V580H360V0Z' }
];

const trackingUnits = -25;
const capHeightUnits = 700;
const fullStopUnits = { left: 149, centreHeight: 81, radius: 95 };

/** How wide the wordmark stands in the world, from the foot of the Y to the edge of its full stop. */
export const brandMarkWidth = 14;

function glyphLefts(): number[] {
	let left = 0;
	return brandGlyphs.map((glyph) => {
		const glyphLeft = left;
		left += glyph.advance + trackingUnits;
		return glyphLeft;
	});
}

export const brandGlyphLefts = glyphLefts();

const lastGlyph = brandGlyphs[brandGlyphs.length - 1];
const lastLeft = brandGlyphLefts[brandGlyphLefts.length - 1];
const fullStopCentreUnits = lastLeft + lastGlyph.advance + trackingUnits + fullStopUnits.left;
const wordmarkUnits = fullStopCentreUnits + fullStopUnits.radius;

/** World units per font unit, so the wordmark comes out brandMarkWidth wide. */
export const brandUnitScale = brandMarkWidth / wordmarkUnits;

export const brandMarkOrigin = { x: -wordmarkUnits / 2, y: -capHeightUnits / 2 };

/** Where the full stop sits, and how big, measured from the middle of the wordmark. */
export const fullStop = {
	x: (fullStopCentreUnits + brandMarkOrigin.x) * brandUnitScale,
	y: (fullStopUnits.centreHeight + brandMarkOrigin.y) * brandUnitScale,
	radius: fullStopUnits.radius * brandUnitScale
};
