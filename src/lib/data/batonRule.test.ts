import { describe, expect, it } from 'vitest';
import { isHandedToWriter, isNobodyNamed } from './batonRule';

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

describe('saying nobody is waiting', () => {
	it('settles the thread when the writer names nobody', () => {
		expect(isNobodyNamed('nobody')).toBe(true);
	});

	it('reads nobody whatever its case or spacing', () => {
		expect(isNobodyNamed(' Nobody ')).toBe(true);
	});

	it('leaves the thread alone when the writer says nothing', () => {
		expect(isNobodyNamed(null)).toBe(false);
	});

	it('leaves the thread alone when the writer names a person', () => {
		expect(isNobodyNamed('stuart@example.com')).toBe(false);
	});
});
