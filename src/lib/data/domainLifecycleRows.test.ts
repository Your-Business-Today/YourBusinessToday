import { describe, expect, it } from 'vitest';
import { lifecycleRowsOf } from './domainLifecycleRows';
import type { DomainThing } from './domainReading';
import type { ThingStation } from './workflowMap/thingStations';

const lead = {
	slug: 'lead',
	statuses: ['Found', 'Introduced'],
	lifecycle: [
		{ status: 'Found', meaning: 'A company we could work for', movesTo: ['Introduced'] },
		{ status: 'Introduced', meaning: 'Met at a first meeting', movesTo: [] }
	]
} as unknown as DomainThing;

function station(stationKey: string, role: ThingStation['role'], status: string | null, thingSlug = 'lead'): ThingStation {
	return { thingSlug, stationKey, stationName: `Station ${stationKey}`, lineName: 'Sales', role, status };
}

describe('lifecycleRowsOf', () => {
	it('gives each status the stations that produce the record in it, and none that only take it in', () => {
		const producers = [station('prospect', 'produces', 'Found'), station('meet', 'produces', 'Introduced')];
		const stations = [...producers, station('introduce', 'takesIn', 'Found'), station('other', 'produces', 'Found', 'client')];
		const rows = lifecycleRowsOf(lead, stations);
		expect(rows.map((row) => [row.status, row.reachedBy.map((reached) => reached.stationKey)])).toEqual([
			['Found', ['prospect']],
			['Introduced', ['meet']]
		]);
		expect(rows[0]).toMatchObject({ meaning: 'A company we could work for', movesTo: ['Introduced'] });
	});

	it('lists statuses filed with no lifecycle as rows with no meaning or moves yet', () => {
		const filedBefore = { ...lead, lifecycle: [] } as DomainThing;
		expect(lifecycleRowsOf(filedBefore, [])).toEqual([
			{ status: 'Found', meaning: '', movesTo: [], reachedBy: [] },
			{ status: 'Introduced', meaning: '', movesTo: [], reachedBy: [] }
		]);
	});
});
