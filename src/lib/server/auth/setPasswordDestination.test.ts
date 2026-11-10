import { describe, expect, it } from 'vitest';
import { readNextDestination } from './setPasswordDestination';

describe('where a set-password link says to go next', () => {
	it('keeps a page on this site, with its query', () => {
		expect(readNextDestination('/portal/connect?organisation=client-1')).toBe('/portal/connect?organisation=client-1');
	});

	it('names nothing for another site, so nobody is sent off it', () => {
		expect(readNextDestination('https://elsewhere.example')).toBe('');
		expect(readNextDestination('//elsewhere.example')).toBe('');
	});

	it('names nothing when the link named nothing', () => {
		expect(readNextDestination(null)).toBe('');
	});
});
