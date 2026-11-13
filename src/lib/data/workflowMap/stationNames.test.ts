import { describe, expect, it } from 'vitest';
import { stationNamesOf } from './stationNames';
import type { MapStation, WorkflowMapVersion } from './workflowMap';

const station = (key: string, name: string) => ({ key, name }) as MapStation;

describe('stationNamesOf', () => {
	it('names each station of the map by its key, and none with no map', () => {
		const map = { lines: [{ key: 'office', name: 'Office', stations: [station('award-order', 'Award order'), station('raise-invoice', 'Raise invoice')] }] } as WorkflowMapVersion;
		expect(stationNamesOf(map)).toEqual({ 'award-order': 'Award order', 'raise-invoice': 'Raise invoice' });
		expect(stationNamesOf(null)).toEqual({});
	});
});
