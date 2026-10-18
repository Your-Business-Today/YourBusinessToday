import { describe, expect, it } from 'vitest';
import { connectorAddressFor } from './connectorAddress';

describe('connectorAddressFor', () => {
	it('gives a portal visitor the site connector', () => {
		const portalUrl = new URL('https://yourbusiness.today/portal/connect');
		expect(connectorAddressFor(portalUrl)).toBe('https://yourbusiness.today/api/mcp');
	});
});
