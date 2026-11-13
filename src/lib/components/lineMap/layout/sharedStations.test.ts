import { describe, expect, it } from 'vitest';
import { combinedMap } from './combinedMap';
import { layoutLineMap } from './layoutLineMap';
import type { LineMapLayout } from './lineMapLayout';
import type { LineMapModel, MapLine } from './lineMapModel';

const signInFirst: LineMapModel = {
	lines: [
		{ id: 'leads', name: 'Win a client', colour: 'teal', stops: ['sign-in', 'leads'] },
		{ id: 'tasks', name: 'Do my own jobs', colour: 'daylight', stops: ['sign-in', 'tasks'] }
	],
	stations: { 'sign-in': { name: 'Sign in' }, leads: { name: 'Leads' }, tasks: { name: 'Tasks' } },
	handovers: []
};

describe('a station shared by several lines', () => {
	it('is one place spanning their lanes', () => {
		const { places } = layoutLineMap(signInFirst);
		expect(places['sign-in'].foot).toBeGreaterThan(places['sign-in'].top);
		const { leads } = places;
		expect(leads.foot).toEqual(leads.top);
	});
});

describe('a map of many lines', () => {
	const lineIds = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	const lines: MapLine[] = lineIds.map((lineId) => ({ id: lineId, name: lineId, colour: 'sky', stops: [lineId] }));
	const stations = Object.fromEntries(lineIds.map((lineId) => [lineId, { name: lineId }]));
	const handovers = [
		{ from: 'one', to: 'nine' },
		{ from: 'nine', to: 'two' }
	];

	it('orders its lanes so a hand-over crosses as few as it can', () => {
		const { laneOrder }: LineMapLayout = layoutLineMap({ lines, stations, handovers });
		expect([...laneOrder].sort()).toEqual([...lineIds].sort());
		expect(Math.abs(laneOrder.indexOf('one') - laneOrder.indexOf('nine'))).toBe(1);
	});
});

describe('two maps laid out together', () => {
	const before: LineMapModel = { ...signInFirst, handovers: [{ from: 'sign-in', to: 'tasks' }] };
	const after: LineMapModel = {
		lines: [{ id: 'leads', name: 'Win a client', colour: 'teal', stops: ['sign-in', 'research', 'leads'] }],
		stations: { 'sign-in': { name: 'Sign in' }, research: { name: 'Research' }, leads: { name: 'Leads' } },
		handovers: []
	};

	it('keeps every line, and each line keeps its stops in order', () => {
		const combined = combinedMap([before, after]);
		expect(combined.lines.map((line) => line.stops)).toEqual([['sign-in', 'research', 'leads'], ['sign-in', 'tasks']]);
		expect(combined.handovers).toEqual([{ from: 'sign-in', to: 'tasks' }]);
	});
});
