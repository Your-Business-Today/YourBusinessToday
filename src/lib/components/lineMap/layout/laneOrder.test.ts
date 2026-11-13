import { describe, expect, it } from 'vitest';
import { orderLanes } from './laneOrder';
import type { LineMapModel, MapHandover, MapLine } from './lineMapModel';

const roles = ['introducer', 'account', 'director', 'billing', 'designer', 'client', 'build', 'release', 'administrator', 'tenant'];
const handovers: MapHandover[] = [
	['introducer', 'account'],
	['account', 'director'],
	['director', 'administrator'],
	['director', 'billing'],
	['administrator', 'client'],
	['administrator', 'tenant'],
	['client', 'designer'],
	['designer', 'client'],
	['designer', 'build'],
	['build', 'release'],
	['release', 'client']
].map(([from, to], index) => ({ from: `${from}-gives-${index}`, to: `${to}-takes-${index}` }));

function stopsOf(role: string): string[] {
	return handovers.flatMap(({ from, to }) => [from, to]).filter((stationId) => stationId.startsWith(`${role}-`));
}

const lines: MapLine[] = roles.map((role) => ({ id: role, name: role, colour: 'sky', stops: stopsOf(role) }));
const stationIds = lines.flatMap((line) => line.stops);
const tenRoles: LineMapModel = { lines, stations: Object.fromEntries(stationIds.map((stationId) => [stationId, { name: stationId }])), handovers };

function lanesCrossed(laneOrder: string[]): number {
	const roleOf = (stationId: string) => stationId.split('-')[0];
	const laneOf = (stationId: string) => laneOrder.indexOf(roleOf(stationId));
	return handovers.reduce((sum, { from, to }) => sum + Math.abs(laneOf(from) - laneOf(to)), 0);
}

describe('the lanes of a map of more roles than are tried every way', () => {
	it('moves a role given late to sit beside the roles it hands to', () => {
		const laneOrder = orderLanes(tenRoles, handovers);
		expect(lanesCrossed(laneOrder)).toBe(15);
	});
});
