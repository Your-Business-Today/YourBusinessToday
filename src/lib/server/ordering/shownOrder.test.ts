import { describe, expect, it } from 'vitest';
import { placementForMove, placementForPosition } from './shownOrder';
import { readShownIds } from '$lib/data/shownIds';
import { withItemBeside } from './rankedSet';

const board = ['a', 'hidden', 'b', 'c'].map((id) => ({ id }));
const shownIds = ['a', 'b', 'c'];

function boardAfter(movedId: string, placement: ReturnType<typeof placementForMove>): string[] {
	if (placement === null) return board.map((row) => row.id);
	const order = withItemBeside(board, movedId, placement.targetId, placement.placement) ?? board;
	return order.map((row) => row.id);
}

describe('readShownIds', () => {
	it('reads none when the form sent none', () => {
		expect(readShownIds(null)).toBeNull();
		expect(readShownIds('')).toBeNull();
	});

	it('splits the ids in order', () => {
		expect(readShownIds('a,b,c')).toEqual(shownIds);
	});
});

describe('placementForMove', () => {
	it('moves up past the shown neighbour, over a hidden row', () => {
		expect(boardAfter('b', placementForMove(shownIds, 'b', 'up'))).toEqual(['b', 'a', 'hidden', 'c']);
	});

	it('moves down past the shown neighbour', () => {
		expect(boardAfter('a', placementForMove(shownIds, 'a', 'down'))).toEqual(['hidden', 'b', 'a', 'c']);
	});

	it('does nothing at the top of the shown rows', () => {
		expect(placementForMove(shownIds, 'a', 'up')).toBeNull();
	});
});

describe('placementForPosition', () => {
	it('puts a row at a shown position, counting only shown rows', () => {
		expect(boardAfter('c', placementForPosition(shownIds, 'c', 2))).toEqual(['a', 'hidden', 'c', 'b']);
	});

	it('moves down to a lower shown position', () => {
		expect(boardAfter('a', placementForPosition(shownIds, 'a', 3))).toEqual(['hidden', 'b', 'c', 'a']);
	});

	it('pulls a position past the end to the last shown place', () => {
		expect(placementForPosition(shownIds, 'a', 99)).toEqual({ targetId: 'c', placement: 'after' });
	});

	it('does nothing when the row is already there', () => {
		expect(placementForPosition(shownIds, 'b', 2)).toBeNull();
	});
});
