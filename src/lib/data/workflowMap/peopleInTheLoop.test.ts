import { describe, expect, it } from 'vitest';
import { productNotNamedYet } from './mapProductNames';
import { peopleInTheLoopOf } from './peopleInTheLoop';
import { callingListAfter, callingListBefore, productNames } from './tests/callingListMaps';

const [sales, analyst] = peopleInTheLoopOf({ before: callingListBefore, after: callingListAfter, productNames });

describe('where people stay in the loop on a workflow map', () => {
	it('gives one row to each role of the After, and none to an outside party or a system', () => {
		const roles = peopleInTheLoopOf({ before: callingListBefore, after: callingListAfter, productNames });
		expect(roles.map(({ roleName }) => roleName)).toEqual(['Sales', 'Bill analyst']);
	});

	it('keeps what is still done elsewhere as theirs', () => {
		expect(sales.staysTheirs).toEqual(['decide who']);
		expect(analyst.staysTheirs).toEqual(['negotiate']);
	});

	it('names the product each step they do inside our products is in', () => {
		expect(sales.insideOurProducts).toEqual([{ stationName: 'make call', productName: 'Calling list' }]);
		expect(analyst.insideOurProducts).toEqual([
			{ stationName: 'confirm error', productName: 'Refund claims workbench' },
			{ stationName: 'draft report', productName: productNotNamedYet }
		]);
	});

	it('takes off their hands a step that moved from their line to a system line, and one gone from the After', () => {
		expect(sales.takenOffTheirHands).toEqual([
			{ stationName: 'build list', nowDoneBy: 'Calling list' },
			{ stationName: 'find proof', nowDoneBy: 'Calling list' }
		]);
		expect(analyst.takenOffTheirHands).toEqual([
			{ stationName: 'read bills', nowDoneBy: 'Refund claims workbench' },
			{ stationName: 'track claim', nowDoneBy: null }
		]);
	});

	it('takes nothing off their hands when no Before is filed', () => {
		const people = peopleInTheLoopOf({ before: null, after: callingListAfter, productNames });
		expect(people.flatMap(({ takenOffTheirHands }) => takenOffTheirHands)).toEqual([]);
	});

	it('lists nobody before an After is filed', () => {
		expect(peopleInTheLoopOf({ before: callingListBefore, after: null, productNames })).toEqual([]);
	});
});
