import { describe, expect, it } from 'vitest';
import { validateConnectionsReading, type ConnectionsReading } from './connectionRules';

const reading: ConnectionsReading = {
	companyNumber: '11111111',
	connections: [{ connectedCompanyNumber: '22222222', connectedCompanyName: 'Smith Holdings Ltd', kind: 'director_owns', throughName: 'Jane Smith' }],
	leftOutOfficers: [],
	checkedAt: '2026-11-14T00:00:00Z'
};

describe('checking a connections reading against its columns', () => {
	it('lets a reading that fits through', () => {
		expect(validateConnectionsReading(reading)).toBeNull();
	});

	it('refuses a name longer than its column, naming the limit', () => {
		const longName = { ...reading.connections[0], connectedCompanyName: 'x'.repeat(201) };
		expect(validateConnectionsReading({ ...reading, connections: [longName] })).toBe('A name is longer than 200 characters: not stored.');
	});

	it('refuses a connected company number that is not one', () => {
		const badNumber = { ...reading.connections[0], connectedCompanyNumber: 'abc' };
		expect(validateConnectionsReading({ ...reading, connections: [badNumber] })).toContain('is not a company number');
	});

	it('refuses more left-out officers than the column holds', () => {
		expect(validateConnectionsReading({ ...reading, leftOutOfficers: Array.from({ length: 101 }, () => 'Agent') })).toContain('more than 100');
	});
});
