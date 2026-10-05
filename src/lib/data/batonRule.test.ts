import { describe, expect, it } from 'vitest';
import { isHandedToWriter } from './batonRule';

describe('who the baton may go to', () => {
	it('refuses a hand-off to the writer themselves', () => {
		expect(isHandedToWriter({ accountId: 'james', kind: 'person' }, 'james')).toBe(true);
	});

	it('refuses a hand-off to the writer’s own Claude', () => {
		expect(isHandedToWriter({ accountId: 'james', kind: 'claude' }, 'james')).toBe(true);
	});

	it('allows a question to someone else', () => {
		expect(isHandedToWriter({ accountId: 'jeremy', kind: 'person' }, 'james')).toBe(false);
	});

	it('allows a message that waits on nobody', () => {
		expect(isHandedToWriter(null, 'james')).toBe(false);
	});
});
