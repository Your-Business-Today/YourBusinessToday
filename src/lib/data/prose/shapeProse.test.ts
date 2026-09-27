import { describe, expect, it } from 'vitest';
import { renderProse } from './renderProse';
import { shapeProse } from './shapeProse';

const countedMeasure =
	'Met when everyone records the day. All three are true: (1) Each person files one log. ' +
	'(2) Every entry carries a name; a photograph reaches its own day. (3) The week composes ' +
	'from the logs alone. The links are one system. Both sides can check it: the fortnight has ' +
	'run; the phone screen has replaced the convention; each person files their own days; and ' +
	'every site has posters in use. This goal is the input.';

describe('shaping prose', () => {
	it('writes an inline (1) (2) (3) run out as a numbered list', () => {
		const shaped = shapeProse(countedMeasure);
		expect(shaped).toContain('All three are true:\n\n1. Each person files one log.\n2. Every');
		expect(shaped).toContain('3. The week composes from the logs alone.\n\nThe links');
	});

	it('writes a colon and semicolon run out as bullets', () => {
		const shaped = shapeProse(countedMeasure);
		expect(shaped).toContain('Both sides can check it:\n\n- the fortnight has run\n');
		expect(shaped).toContain('- every site has posters in use\n\nThis goal is the input.');
	});

	it('leaves a single numbered aside and a short semicolon sentence alone', () => {
		const plain = 'See (1) above. Note: one; two.';
		expect(shapeProse(plain)).toBe(plain);
	});

	it('leaves Markdown the writer already laid out alone', () => {
		const markdown = '- (1) one\n- (2) two';
		expect(shapeProse(markdown)).toBe(markdown);
	});
});

describe('rendering prose', () => {
	it('shows raw HTML as text', () => {
		expect(renderProse('<script>alert(1)</script>')).not.toContain('<script>');
	});

	it('drops links that are not to the web or mail', () => {
		expect(renderProse('[click](javascript:alert(1))')).not.toContain('href');
		expect(renderProse('[site](https://example.com)')).toContain('href="https://example.com"');
	});
});
