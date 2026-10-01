import { describe, expect, it } from 'vitest';
import { webAddressLabel } from './webAddressLabel';

describe('webAddressLabel', () => {
	it('drops the protocol and the trailing slash', () => {
		expect(webAddressLabel('https://github.com/jamesbeadle/YourBusinessToday/')).toBe(
			'github.com/jamesbeadle/YourBusinessToday'
		);
	});
});
