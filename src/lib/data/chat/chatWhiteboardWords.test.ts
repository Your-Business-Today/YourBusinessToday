import { describe, expect, it } from 'vitest';
import { renderProse } from '$lib/data/prose/renderProse';
import { savedSinceRefusal, whiteboardPictureName, whiteboardPostWords } from './chatWhiteboardWords';

const boardPath = '/organisations/o/chat/r/whiteboards/w';

describe('the words of a whiteboard', () => {
	it('posts the board to its room with its title linked back to the board', () => {
		expect(whiteboardPostWords('Kitchen layout', boardPath)).toBe(`Whiteboard: [Kitchen layout](${boardPath})`);
		expect(renderProse(whiteboardPostWords('Kitchen layout', boardPath))).toContain(`<a href="${boardPath}"`);
	});

	it('keeps a title with brackets from breaking the link', () => {
		const rendered = renderProse(whiteboardPostWords('Plan [v2]', boardPath));
		expect(rendered).toContain(`href="${boardPath}"`);
		expect(rendered).toContain('Plan [v2]');
	});

	it('names the picture for the board, and the person who saved it meanwhile and when, on the UK clock', () => {
		expect(whiteboardPictureName('Kitchen')).toBe('Whiteboard Kitchen.png');
		expect(savedSinceRefusal('Sam', '2026-11-23T14:02:00Z')).toBe('Sam saved this board at 14:02. Open it again to carry on from theirs.');
		expect(savedSinceRefusal('Sam', '2026-07-01T13:02:00Z')).toContain('at 14:02.');
	});
});
