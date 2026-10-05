import { describe, expect, it } from 'vitest';
import { isRequest } from './queueBand';

describe('which tasks are requests', () => {
	it('counts a task asked for by someone other than the owner', () => {
		expect(isRequest({ requestedBy: 'jeremy', projectOwnerId: 'james' })).toBe(true);
	});

	it('does not count the owner’s own task', () => {
		expect(isRequest({ requestedBy: 'james', projectOwnerId: 'james' })).toBe(false);
	});

	it('does not count a task whose project owner is not known', () => {
		expect(isRequest({ requestedBy: 'jeremy', projectOwnerId: null })).toBe(false);
	});
});
