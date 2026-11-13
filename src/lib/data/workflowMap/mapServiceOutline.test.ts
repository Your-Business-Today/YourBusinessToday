import { describe, expect, it } from 'vitest';
import { outlineMapServices } from './mapServiceOutline';
import type { MapStation, StationState, WorkflowMapVersion } from './workflowMap';

function station(key: string, state: StationState, productId: string | null = null, isOutput = false): MapStation {
	const name = key.replace('-', ' ');
	const empty = { takesIn: [], produces: [], doneIn: null, takesInThings: [], producesThings: [] };
	return { key, name, summary: `${name}.`, isOutput, state, productId, ...empty };
}

const portal = 'product-portal';

const map: WorkflowMapVersion = {
	stage: 'after',
	versionNumber: 2,
	recordedAt: '2026-11-13T06:00:00Z',
	lines: [
		{ key: 'estimator', name: 'Estimator', kind: 'role', stations: [station('price-job', 'planned', portal), station('send-quote', 'ours', portal)] },
		{
			key: 'quantity-surveyor',
			name: 'Quantity surveyor',
			kind: 'role',
			stations: [station('book-costs', 'planned', null), station('value-work', 'planned', portal, true), station('chase', 'elsewhere')]
		}
	],
	handovers: [
		{ fromKey: 'price-job', toKey: 'book-costs', handedOver: 'the priced job', goesWrong: 'Prices arrive by email and are retyped.' },
		{ fromKey: 'send-quote', toKey: 'chase', handedOver: 'the quote', goesWrong: null }
	],
	arrivals: []
};

describe('the services a confirmed workflow map suggests', () => {
	const outline = outlineMapServices(map);

	it('groups the planned stations by product in the order the map names them, outputs first', () => {
		const keysOf = outline.products.map(({ productId, stations }) => [productId, stations.map(({ station }) => station.key)]);
		expect(keysOf).toEqual([
			[portal, ['value-work', 'price-job']],
			[null, ['book-costs']]
		]);
	});

	it('names each planned station’s line and what goes wrong in the hand-overs it touches', () => {
		const pricing = outline.products[0].stations[1];
		expect(pricing.lineName).toBe('Estimator');
		expect(pricing.goesWrong).toEqual(['Prices arrive by email and are retyped.']);
	});

	it('lists every hand-over that goes wrong today, by the names of its stations', () => {
		expect(outline.troubledHandovers).toEqual([
			{ fromName: 'price job', toName: 'book costs', handedOver: 'the priced job', goesWrong: 'Prices arrive by email and are retyped.' }
		]);
	});
});
