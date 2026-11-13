import { describe, expect, it } from 'vitest';
import { glossaryJoinMap, glossaryJoinVocabulary } from './tests/glossaryJoinMap';
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
	arrivals: [],
	lines: [{ key: 'surveyor', name: 'Surveyor', kind: 'role', stations: [station('price-the-job', ['enquiry'], ['quote']), station('visit-site', [], [])] }]
};

const touchesOf = (stations: ReturnType<typeof thingStationsOf>) =>
	stations.map(({ stationKey, thingSlug, role, status }) => `${stationKey} ${role} ${thingSlug}${status === null ? '' : ` (${status})`}`);

describe('thingStationsOf', () => {
	it('names each thing a station takes in or produces by its filed slugs, with the station and its line', () => {
		expect(thingStationsOf(map)).toEqual([
			{ thingSlug: 'enquiry', stationKey: 'price-the-job', stationName: 'The price-the-job', lineName: 'Surveyor', role: 'takesIn', status: null },
			{ thingSlug: 'quote', stationKey: 'price-the-job', stationName: 'The price-the-job', lineName: 'Surveyor', role: 'produces', status: null }
		]);
	});

	it('finds the things through the glossary with no slugs filed, in the status a word names, hand-overs counted once', () => {
		expect(touchesOf(thingStationsOf(glossaryJoinMap, glossaryJoinVocabulary))).toEqual([
			'award-work takesIn subcontractor',
			'award-work produces work-order',
			'bill-client takesIn work-order',
			'bill-client produces invoice (sent)',
			'chase-payment takesIn invoice (sent)',
			'chase-payment produces invoice'
		]);
	});

	it('names none while no map is filed', () => {
		expect(thingStationsOf(null)).toEqual([]);
	});
});
