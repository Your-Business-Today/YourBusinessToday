import { describe, expect, it } from 'vitest';
import { whiteboardDrawingBytes } from './whiteboardDrawingBytes';

describe('whiteboardDrawingBytes', () => {
	it('counts the drawing as Postgres writes jsonb back as text, a space after every comma and colon', () => {
		const items = [{ tool: 'text', colour: 'red', size: 40, at: [1, 20], text: 'Café, here: £5' }];
		const asPostgresWritesIt = '[{"tool": "text", "colour": "red", "size": 40, "at": [1, 20], "text": "Café, here: £5"}]';
		expect(whiteboardDrawingBytes(items)).toBe(new TextEncoder().encode(asPostgresWritesIt).length);
	});

	it('counts an empty board, and a stroke of one point', () => {
		expect(whiteboardDrawingBytes([])).toBe('[]'.length);
		const asPostgresWritesIt = '[{"tool": "pen", "colour": "black", "width": 3, "points": [[0, 0]]}]';
		expect(whiteboardDrawingBytes([{ tool: 'pen', colour: 'black', width: 3, points: [[0, 0]] }])).toBe(asPostgresWritesIt.length);
	});
});
