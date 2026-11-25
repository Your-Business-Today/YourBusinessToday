import { describe, expect, it } from 'vitest';
import { documentShelvesOf } from './documentShelves';

const placed = { section: 'General', position: 0 };
const brief = { ...placed, title: 'Client brief', flow: 'input' as const };
const report = { ...placed, title: 'Final report', flow: 'output' as const };

describe('an owner’s documents put apart into outputs and inputs', () => {
	it('puts the outputs first, since they are usually the valuable part', () => {
		expect(documentShelvesOf([brief, report]).map((shelf) => shelf.heading)).toEqual(['Outputs', 'Inputs']);
	});

	it('leaves out a shelf with nothing on it', () => {
		expect(documentShelvesOf([brief]).map((shelf) => shelf.flow)).toEqual(['input']);
		expect(documentShelvesOf([])).toEqual([]);
	});
});
