import { describe, expect, it } from 'vitest';
import { labelsThatFit } from './labelPlacement';

const bounds = { topPixels: 50, widthPixels: 400, heightPixels: 300 };
const boxAt = (left: number, top: number) => ({ left, top, width: 100, height: 20 });

describe('where the labels of the drawn brain go', () => {
	it('keeps a label out of the way of one already placed, taking its next place when it has one', () => {
		const placed = labelsThatFit([[boxAt(100, 100)], [boxAt(120, 105), boxAt(120, 140)], [boxAt(110, 110)]], bounds);
		expect(placed).toEqual([boxAt(100, 100), boxAt(120, 140), null]);
	});

	it('shows no label under the controls, off the screen or beneath a panel', () => {
		const placed = labelsThatFit([[boxAt(10, 10)], [boxAt(-5, 100)], [boxAt(350, 100)]], bounds);
		expect(placed).toEqual([null, null, null]);
	});
});
