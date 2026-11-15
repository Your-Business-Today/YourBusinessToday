import { describe, expect, it } from 'vitest';
import { filmInkOf } from './filmInk';
import { filmRecipeOf } from './filmRecipe';
import { filmShapeForMedium, wordBands } from './filmFrame';
import { placeWords } from './placeWords';
import { savedNameOf, shellQuoted } from './recipeShell';

const words = { overline: 'Fire safety', headline: 'Shut the door', underline: 'Jewel', wordsAt: 'bottom' as const };
const shot = { seconds: 3, clip: { url: 'https://files.example/clip?token=a', filename: 'door.MOV' }, isVideo: true, words };
const video = { kind: 'video' as const, shape: 'wide' as const, look: {}, uploadUrl: "https://files.example/up?token=it's", largestByteCount: 100, shots: [shot], music: null };

describe('the recipe a user’s Claude runs to make a piece', () => {
	it('quotes every value it is given as one word of bash', () => {
		expect(shellQuoted("it's $HOME")).toBe(`'it'\\''s $HOME'`);
		expect(filmRecipeOf(video, 'making-1')).toContain(`--data-binary @film.mp4 'https://files.example/up?token=it'\\''s'`);
	});

	it('works in a folder of its own, saving each file under its own extension', () => {
		const recipe = filmRecipeOf(video, 'abcd1234-ffff');
		expect(recipe).toContain('mkdir -p ybt-film-abcd1234');
		expect(recipe).toContain("curl -sSfL -o clip1.mov 'https://files.example/clip?token=a'");
		expect(savedNameOf('music', 'tune')).toBe('music');
	});

	it('lays the shot over silence when the piece has no music, cut to the film’s length', () => {
		expect(filmRecipeOf(video, 'm')).toContain('-f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -af apad -t 3');
	});

	it('draws the words in the brand’s ink, or the kit’s where the brand gives none a recipe can carry', () => {
		expect(filmInkOf({ '--brand-colour-accent': '#E63', '--brand-type-display-family': "'Inter Tight', sans-serif" })).toEqual({ text: 'eef1f8', accent: 'ee6633', font: 'Inter Tight' });
		expect(filmInkOf({ '--brand-colour-caption-text': 'white', '--brand-type-display-family': "x';y" })).toMatchObject({ text: 'eef1f8', font: 'xy' });
	});

	it('sets the words at the foot of their band when they sit at the bottom, the overline beside its dot', () => {
		const { wide } = wordBands;
		const band = wide.bottom;
		const placed = placeWords(words, band);
		const lastLine = placed.lines.at(-1);
		expect(placed.lines.map((line) => line.text)).toEqual(['Fire safety', 'Shut the door', 'Jewel']);
		expect(placed.dot).toMatchObject({ x: band.x });
		expect(lastLine?.isFaded).toBe(true);
		expect((lastLine?.y ?? 0) + (lastLine?.size ?? 0)).toBeLessThanOrEqual(band.y + band.height);
	});

	it('makes short video and stories tall, posts and carousels square, anything else wide', () => {
		expect(['video.short.tiktok', 'image.story', 'image.carousel.instagram', 'image.post', 'video.long'].map(filmShapeForMedium)).toEqual(['tall', 'tall', 'square', 'square', 'wide']);
	});
});
