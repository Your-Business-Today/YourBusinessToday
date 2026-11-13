import { describe, expect, it } from 'vitest';
import { juneAfter, juneBefore, productNames } from './tests/juneBeforeAndAfter';
import { lineColoursOf, lineMapOf } from './workflowLineMap';
import { mapChangesBetween } from './workflowMapChanges';
import { openingStageOf, isComparing } from './workflowMapTabs';
import { stationDetailsOf } from './stationDetails';

const before = juneBefore();
const after = juneAfter();
const colours = lineColoursOf([before, after]);

describe('lineMapOf', () => {
	it('draws each role as a line in the June map’s colours, outputs as double rings and failures on their hand-overs', () => {
		const { lines, stations, handovers } = lineMapOf(before, colours);
		expect(lines.map((line) => line.colour)).toEqual(['peach', 'lilac', 'sky', 'teal', 'rose', 'daylight']);
		expect(stations.pvr).toEqual({ name: 'PVR', kind: 'output', state: 'elsewhere' });
		const award = handovers.find((handover) => handover.to === 'work-order-award');
		expect(award?.failure).toContain('lapsed insurance');
	});
});

describe('stationDetailsOf', () => {
	it('says what Work order award takes in and from whom, what it produces for whom, and where it was done before', () => {
		const details = stationDetailsOf(after, { earlierMap: before, colours, productNames }, 'work-order-award');
		expect(details?.lineName).toBe('QS / Estimator');
		expect(details?.inputs).toEqual([
			{ item: 'Levelled quote comparison', source: 'From Subbie quotes', goesWrong: null },
			{ item: 'Verified compliance record', source: 'Handed over by Office & Compliance, from Insurance & CIS checks', goesWrong: null }
		]);
		expect(details?.outputs).toEqual([{ item: 'Work order', destination: 'To Site mobilisation and Cost capture' }]);
		expect(details?.place).toEqual({ place: 'JPMS portal', state: 'ours', earlierPlace: 'Spreadsheet and email' });
		expect(details?.things).toEqual(['Compliance record', 'Work order', 'Subcontractor']);
	});

	it('says how a hand-over goes wrong today on the Before', () => {
		const details = stationDetailsOf(before, { earlierMap: null, colours, productNames }, 'work-order-award');
		const handedOver = details?.inputs[1];
		const place = details?.place;
		expect(handedOver?.goesWrong).toContain('lapsed insurance');
		expect(place?.earlierPlace).toBeNull();
	});

	it('is null for a station the map does not have', () => {
		expect(stationDetailsOf(after, { earlierMap: before, colours, productNames }, 'no-such-station')).toBeNull();
	});
});

describe('mapChangesBetween', () => {
	it('lists each task that moves into a product, then each hand-over that stops going wrong', () => {
		const changes = mapChangesBetween({ before, after, productNames });
		expect(changes.map((change) => change.what)).toEqual([
			'Insurance & CIS checks',
			'Work order award',
			'Settlement & VAT',
			'Verified compliance record',
			'Mobilisation checklist',
			'Approved site progress'
		]);
		expect(changes[1]).toMatchObject({ role: 'QS / Estimator', before: 'Spreadsheet and email', after: 'Done in JPMS portal' });
		expect(changes[2].after).toBe('Planned for JPMS portal');
		expect(changes[3]).toMatchObject({ kind: 'Hand-over', role: 'Office & Compliance to QS / Estimator', after: 'Stops going wrong' });
	});

	it('lists nothing until both are filed', () => {
		expect(mapChangesBetween({ before: null, after, productNames })).toEqual([]);
	});
});

describe('the page’s opening map', () => {
	it('opens on the After when one is filed, and shows tabs only when it has a Before to compare', () => {
		expect(openingStageOf({ before, after, productNames })).toBe('after');
		expect(openingStageOf({ before: null, after, productNames })).toBe('after');
		expect(openingStageOf({ before, after: null, productNames })).toBe('before');
		expect(openingStageOf({ before: null, after: null, productNames })).toBeNull();
		expect(isComparing({ before: null, after, productNames })).toBe(false);
		expect(isComparing({ before, after, productNames })).toBe(true);
	});
});
