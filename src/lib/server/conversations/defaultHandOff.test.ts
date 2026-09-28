import { describe, expect, it } from 'vitest';
import { suggestHandOff } from './defaultHandOff';

describe('who a message waits on by default', () => {
	it('hands back to whoever spoke last', () => {
		const thread = [{ authorAccountId: 'raiser' }, { authorAccountId: 'dan' }];
		expect(suggestHandOff(thread, 'james', 'raiser')).toEqual({ accountId: 'dan', kind: 'person' });
	});

	it('falls back to whoever raised it when the writer spoke last', () => {
		const thread = [{ authorAccountId: 'james' }];
		expect(suggestHandOff(thread, 'james', 'raiser')).toEqual({
			accountId: 'raiser',
			kind: 'person'
		});
	});

	it('waits on nobody when the writer raised it and spoke last', () => {
		expect(suggestHandOff([{ authorAccountId: 'james' }], 'james', 'james')).toBeNull();
	});
});
