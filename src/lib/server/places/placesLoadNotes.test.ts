import { describe, expect, it } from 'vitest';
import { placesHeldNote, placesPartWayNote } from './placesLoadNotes';
import type { GroundedPlace } from './placesForPatch';

const held = Array.from({ length: 3 }, (_, index) => ({ sourceId: `place-${index}` }) as GroundedPlace);

describe("what a load of a territory's trading places says", () => {
	it('says how far a load cut off part way has got', () => {
		expect(placesPartWayNote('2026-10-21.0', 500, 10_208)).toBe('Release 2026-10-21.0: 500 of 10208 trading places written so far.');
	});

	it('says how many it holds, how many of them were placed by their point, and what was left out and why', () => {
		const sorted = { toWrite: held, placedByPointCount: 1, refusedCount: 6, unplacedCount: 2, outsideCount: 4 };
		expect(placesHeldNote('2026-10-21.0', sorted, { unreadableCount: 1, goneCount: 5 })).toBe(
			'Release 2026-10-21.0: 3 trading places held, 1 of them placed by the postcode nearest their point. ' +
				'Left out: 6 the rules refuse (unsure, share-alike or too long), 2 with no postcode listed or near their point, 4 outside its outcodes, 1 with no name or point. 5 marked gone.'
		);
	});
});
