import { describe, expect, it } from 'vitest';
import { isConnectorDestination, isSignUpDestination } from './connectorDestination';

describe('isConnectorDestination', () => {
	it('recognises the connector asking a signed-in person to allow their Claude', () => {
		expect(isConnectorDestination('/oauth/authorize?client_id=claude&state=abc')).toBe(true);
	});

	it('leaves every other destination to the usual door rules', () => {
		expect(isConnectorDestination('/projects')).toBe(false);
		expect(isConnectorDestination('/portal')).toBe(false);
		expect(isConnectorDestination(null)).toBe(false);
	});
});

describe('isSignUpDestination', () => {
	it('keeps signing a business up at yourbusiness.today', () => {
		expect(isSignUpDestination('/start')).toBe(true);
	});

	it('leaves every other destination to the usual door rules', () => {
		expect(isSignUpDestination('/projects')).toBe(false);
		expect(isSignUpDestination(null)).toBe(false);
	});
});
