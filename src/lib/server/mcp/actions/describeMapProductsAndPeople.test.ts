import { describe, expect, it } from 'vitest';
import { describeMapProducts, howProductsChange } from './describeMapProducts';
import { describePeopleInTheLoop, howPeopleInTheLoopChange } from './describePeopleInTheLoop';
import { peopleInTheLoopOf } from '$lib/data/workflowMap/peopleInTheLoop';
import { productsOnTheMap } from '$lib/data/workflowMap/productsOnTheMap';
import { callingListAfter, callingListBefore, productNames } from '$lib/data/workflowMap/tests/callingListMaps';

const maps = { before: callingListBefore, after: callingListAfter, productNames };

describe('read_map_products', () => {
	const answer = describeMapProducts('Water Co', callingListAfter, productsOnTheMap(maps));

	it('lists each product with its stage, its steps by key and line, and what goes wrong there today', () => {
		expect(answer).toContain('1. **Calling list**, planned. Takes on: make call (`make-call`, on Sales)');
		expect(answer).toContain('2. **Refund claims workbench**, live.');
		expect(answer).toContain('What goes wrong there today: Errors are missed.');
	});

	it('ends by saying how a product is changed', () => {
		expect(answer.endsWith(howProductsChange)).toBe(true);
	});
});

describe('read_people_in_the_loop', () => {
	it('gives each role what stays theirs, what they do inside our products and what is taken off their hands', () => {
		const answer = describePeopleInTheLoop('Water Co', callingListAfter, peopleInTheLoopOf(maps), true);
		expect(answer).toContain('### Bill analyst\n- Stays theirs: negotiate\n- Done inside our products: confirm error, in Refund claims workbench');
		expect(answer).toContain('Taken off their hands: read bills, now done by Refund claims workbench; track claim, no longer on the map');
		expect(answer.endsWith(howPeopleInTheLoopChange)).toBe(true);
	});

	it('says nothing is taken off anyone’s hands until a Before is filed', () => {
		const withoutBefore = { ...maps, before: null };
		const answer = describePeopleInTheLoop('Water Co', callingListAfter, peopleInTheLoopOf(withoutBefore), false);
		expect(answer).toContain('No Before map is filed');
		expect(answer).toContain('- Taken off their hands: nothing');
	});
});
