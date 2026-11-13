import { describe, expect, it } from 'vitest';
import { juneAfter, juneBefore, portalProductId } from '$lib/components/organisations/workflowMap/tests/juneBeforeAndAfter';
import { lineColoursOf } from '$lib/components/organisations/workflowMap/workflowLineMap';
import { productStationsOf } from './productStations';
import { productWorkflowMapMessages } from './productWorkflowMapWords';

const before = juneBefore();
const after = juneAfter();
const colours = lineColoursOf([before, after]);
const anotherProductId = '5d1e0c4a-0000-4000-8000-00000000beef';

describe('productStationsOf', () => {
	it('lists the stations the After names the portal on, with their role, what they take in and produce, and their state', () => {
		const stations = productStationsOf(after, portalProductId, colours);
		expect(stations.map((station) => station.key)).toEqual(['insurance-cis-checks', 'work-order-award', 'settlement-vat']);
		const award = stations[1];
		expect(award.roleName).toBe('QS / Estimator');
		expect(award.roleColour).toBe('sky');
		expect(award.takesIn).toBe('Levelled quote comparison, Verified compliance record');
		expect(award.produces).toBe('Work order');
		expect(award.state).toBe('ours');
		expect(stations[2].state).toBe('planned');
	});

	it('lists nothing for a product the map does not name, and nothing on a Before that names no product', () => {
		expect(productStationsOf(after, anotherProductId, colours)).toEqual([]);
		expect(productStationsOf(before, portalProductId, colours)).toEqual([]);
	});
});

describe('productWorkflowMapMessages', () => {
	it('says in one line that a product runs no station yet', () => {
		const messages = productWorkflowMapMessages('JPMS portal', 'Jewel Bespoke Build');
		expect(messages.runsNoStation).toBe("JPMS portal runs no station on Jewel Bespoke Build's workflow map yet.");
	});
});
