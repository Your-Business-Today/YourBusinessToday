import { describe, expect, it } from 'vitest';
import { amended, amendableMap, plainStation, stationKeysOf } from './tests/amendableMap';

const putOnSales = (afterKey: string | null) => ({ stations: [{ station: plainStation('switch-supply'), lineKey: 'sales', afterKey }] });

describe('putting a station on a workflow map', () => {
	it('puts a new station at the end of its line, or after the station it names', () => {
		expect(stationKeysOf(amended(putOnSales(null)).draft).sales).toEqual(['call', 'bill-audit-offer', 'switch-supply']);
		const { draft, changes } = amended(putOnSales('call'));
		expect(stationKeysOf(draft).sales).toEqual(['call', 'switch-supply', 'bill-audit-offer']);
		expect(changes.added).toEqual(['station "switch-supply" on line "sales"']);
	});

	it('replaces a station in its place and carries every other station forward exactly', () => {
		const replacement = plainStation('check-bills', 'Their Claude reads past bills and flags likely errors.');
		const { draft, changes } = amended({ stations: [{ station: replacement, lineKey: null, afterKey: null }] });
		const [sales, billAnalyst] = draft.lines;
		expect(billAnalyst.stations).toEqual([replacement, plainStation('claim')]);
		expect(sales).toEqual(amendableMap().lines[0]);
		expect(draft.handovers).toEqual(amendableMap().handovers);
		expect(changes).toEqual({ added: [], replaced: ['station "check-bills"'], moved: [], removed: [], removedWith: [] });
	});

	it('moves a station given on another line there, keeping its key and its hand-overs', () => {
		const { draft, changes } = amended({ stations: [{ station: plainStation('claim'), lineKey: 'finance', afterKey: null }] });
		const expected = { sales: ['call', 'bill-audit-offer'], 'bill-analyst': ['check-bills'], finance: ['share-invoice', 'claim'] };
		expect(stationKeysOf(draft)).toEqual(expected);
		expect(draft.handovers).toEqual(amendableMap().handovers);
		expect(changes.moved).toEqual(['station "claim" to line "finance"']);
		expect(changes.replaced).toEqual([]);
	});
});
