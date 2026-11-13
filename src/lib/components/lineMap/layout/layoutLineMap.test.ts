import { describe, expect, it } from 'vitest';
import { juneMapAfter, juneMapBefore } from '../tests/juneWorkflowMap';
import { forksThroughStations, namesUnderLines } from '../tests/mapChecks';
import { ybtStaffJourneys } from '../tests/ybtStaffJourneys';
import { layoutLineMap } from './layoutLineMap';
import type { LineMapModel } from './lineMapModel';

const juneLayout = layoutLineMap(juneMapAfter);

describe('the June map of Jewel Bespoke Build', () => {
	it('puts every station on a whole column', () => {
		expect(Object.values(juneLayout.columns).every(Number.isInteger)).toBe(true);
	});

	it('orders the lanes so the hand-overs travel the shortest way', () => {
		const expected = ['compliance', 'project-manager', 'quantity-surveyor', 'finance-director', 'site-manager', 'health-safety'];
		expect(juneLayout.laneOrder).toEqual(expected);
	});

	it('runs no fork through a station', () => {
		expect(forksThroughStations(juneLayout)).toEqual([]);
	});

	it('puts no name under a line or a fork', () => {
		expect(namesUnderLines(juneLayout)).toEqual([]);
	});

	it('forks every hand-over and leaves none going back', () => {
		const { handovers } = juneMapAfter;
		expect(juneLayout.branches).toHaveLength(handovers.length);
		expect(juneLayout.goingBack).toEqual([]);
	});

	it('lays the Before map on the same places as the After map', () => {
		expect(layoutLineMap(juneMapBefore).places).toEqual(juneLayout.places);
	});
});

const loopingMap: LineMapModel = {
	lines: [
		{ id: 'sales', name: 'Sales', colour: 'sky', stops: ['enquiry', 'quote', 'order'] },
		{ id: 'site', name: 'Site', colour: 'teal', stops: ['survey', 'snag'] }
	],
	stations: { enquiry: { name: 'Enquiry' }, quote: { name: 'Quote' }, order: { name: 'Order' }, survey: { name: 'Survey' }, snag: { name: 'Snag' } },
	handovers: [
		{ from: 'quote', to: 'snag' },
		{ from: 'snag', to: 'enquiry' }
	]
};

describe('a hand-over that goes back to an earlier station', () => {
	const layout = layoutLineMap(loopingMap);

	it('is left out of the ordering and its giving station is marked as going back', () => {
		expect(layout.goingBack).toEqual(['snag']);
		expect(layout.branches.map((branch) => `${branch.from} to ${branch.to}`)).toEqual(['quote to snag']);
	});

	it('still lays the map out on whole columns', () => {
		expect(Object.values(layout.columns).every(Number.isInteger)).toBe(true);
		const { columns } = layout;
		expect(columns.snag).toBeGreaterThan(columns.quote);
	});
});

const twoWayMap: LineMapModel = {
	lines: [
		{ id: 'read-the-domain', name: 'Read the domain', colour: 'sky', stops: ['domain', 'workflow-map'] },
		{ id: 'read-the-workflow-map', name: 'Read the workflow map', colour: 'teal', stops: ['workflow-map', 'domain'] }
	],
	stations: { domain: { name: 'Domain' }, 'workflow-map': { name: 'Workflow map' } },
	handovers: []
};

describe('lines that run between the same stations in opposite directions', () => {
	it('keeps the stations next to each other instead of pushing them apart without end', () => {
		const { columns } = layoutLineMap(twoWayMap);
		expect(columns).toEqual({ domain: 0, 'workflow-map': 1 });
	});

	it("lays out the staff member's journeys on the site map that froze the page, on no more columns than it has stations", () => {
		const { columns } = layoutLineMap(ybtStaffJourneys);
		const stationCount = Object.keys(ybtStaffJourneys.stations).length;
		expect(Math.max(...Object.values(columns))).toBeLessThan(stationCount);
	});
});
