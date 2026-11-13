import { describe, expect, it } from 'vitest';
import { thingStationsOf } from './thingStations';
import type { MapStation, WorkflowMapVersion } from './workflowMap';

const station = (key: string, takesInThings: string[], producesThings: string[]): MapStation => ({
	key,
	name: `The ${key}`,
	summary: '',
	takesIn: [],
	produces: [],
	doneIn: null,
	isOutput: false,
	state: 'elsewhere',
	productId: null,
	takesInThings,
	producesThings
});

const map: WorkflowMapVersion = {
	stage: 'after',
	versionNumber: 1,
	recordedAt: '2026-11-13T05:00:00Z',
	handovers: [],
	lines: [{ key: 'surveyor', name: 'Surveyor', stations: [station('price-the-job', ['enquiry'], ['quote']), station('visit-site', [], [])] }]
};

describe('thingStationsOf', () => {
	it('names each thing a station takes in or produces, with the station and its line', () => {
		expect(thingStationsOf(map)).toEqual([
			{ thingSlug: 'enquiry', stationKey: 'price-the-job', stationName: 'The price-the-job', lineName: 'Surveyor', role: 'takesIn' },
			{ thingSlug: 'quote', stationKey: 'price-the-job', stationName: 'The price-the-job', lineName: 'Surveyor', role: 'produces' }
		]);
	});

	it('names none while no map is filed', () => {
		expect(thingStationsOf(null)).toEqual([]);
	});
});
