import { describe, expect, it } from 'vitest';
import { askKinds, parseAskKind } from './askKind';

describe('an ask kind', () => {
	it('reads the three kinds and nothing else', () => {
		expect(parseAskKind('setup')).toBe(askKinds.setup);
		expect(parseAskKind('testing')).toBe(askKinds.testing);
		expect(parseAskKind('build')).toBeNull();
		expect(parseAskKind(null)).toBeNull();
	});
});
