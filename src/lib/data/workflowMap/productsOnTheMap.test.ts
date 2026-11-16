import { describe, expect, it } from 'vitest';
import { productNotNamedYet } from './mapProductNames';
import { productStages, productsOnTheMap } from './productsOnTheMap';
import { callingListAfter, callingListBefore, productNames } from './tests/callingListMaps';

const products = productsOnTheMap({ before: callingListBefore, after: callingListAfter, productNames });

describe('the products a workflow map recommends', () => {
	it('names each product by its project, else where its steps are done, in the order the After first names them', () => {
		expect(products.map(({ name }) => name)).toEqual(['Calling list', 'Refund claims workbench', productNotNamedYet]);
	});

	it('gathers a product named only where its steps are done from every line it sits on', () => {
		const steps = products[0].steps.map(({ stationName, lineName }) => [stationName, lineName]);
		expect(steps).toEqual([
			['make call', 'Sales'],
			['build list', 'Calling list'],
			['find proof', 'Calling list']
		]);
	});

	it('calls a product live once a step is done in it, and planned while every step is only planned', () => {
		expect(products.map(({ stage }) => stage)).toEqual([productStages.planned, productStages.live, productStages.planned]);
	});

	it('says what goes wrong today in the hand-overs its steps touch, once each', () => {
		expect(products[0].fixes).toEqual(['The list is out of date.']);
		expect(products[1].fixes).toEqual(['Errors are missed.']);
	});

	it('reads what goes wrong from the After when no Before is filed', () => {
		const withoutBefore = productsOnTheMap({ before: null, after: callingListAfter, productNames });
		expect(withoutBefore[0].fixes).toEqual([]);
	});

	it('lists no products before an After is filed', () => {
		expect(productsOnTheMap({ before: callingListBefore, after: null, productNames })).toEqual([]);
	});
});
