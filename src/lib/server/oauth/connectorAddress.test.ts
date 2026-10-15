import { describe, expect, it } from 'vitest';
import { connectorAddressFor } from './connectorAddress';

const staffOrigin = 'https://yourbusiness.today';
const portalUrl = new URL('https://portal.yourbusiness.today/connect');
const staffUrl = new URL('https://yourbusiness.today/portal/connect');

describe('connectorAddressFor', () => {
	it('gives a portal visitor the staff site connector', () => {
		const door = { isPortal: true, otherDoorOrigin: staffOrigin };
		expect(connectorAddressFor(door, portalUrl)).toBe('https://yourbusiness.today/api/mcp');
	});

	it('gives a staff site visitor its own connector', () => {
		const door = { isPortal: false, otherDoorOrigin: 'https://portal.yourbusiness.today' };
		expect(connectorAddressFor(door, staffUrl)).toBe('https://yourbusiness.today/api/mcp');
	});
});
