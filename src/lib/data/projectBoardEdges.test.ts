import { describe, expect, it } from 'vitest';
import { boardEdgesOf } from './projectBoardEdges';

const yoursFirst = { id: 'yours-first', isYours: true };
const yoursLast = { id: 'yours-last', isYours: true };
const othersFirst = { id: 'others-first', isYours: false };
const othersLast = { id: 'others-last', isYours: false };
const shownProjects = [yoursFirst, yoursLast, othersFirst, othersLast];

describe('boardEdgesOf', () => {
	it('ends your own projects at the last one you own', () => {
		expect(boardEdgesOf(yoursLast, shownProjects)).toEqual({
			isFirst: false,
			isLast: true
		});
	});

	it('starts the projects others own at the first of them', () => {
		expect(boardEdgesOf(othersFirst, shownProjects)).toEqual({
			isFirst: true,
			isLast: false
		});
	});

	it('marks a project alone on its board as both ends', () => {
		expect(boardEdgesOf(othersLast, [yoursFirst, othersLast])).toEqual({
			isFirst: true,
			isLast: true
		});
	});
});
