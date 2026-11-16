import { describe, expect, it } from 'vitest';
import { askKinds, parseAskKind } from './askKind';

describe('an ask kind', () => {
	it('reads the two kinds and nothing else, testing included', () => {
		expect(parseAskKind('setup')).toBe(askKinds.setup);
		expect(parseAskKind('information')).toBe(askKinds.information);
		expect(parseAskKind('testing')).toBeNull();
		expect(parseAskKind('build')).toBeNull();
		expect(parseAskKind(null)).toBeNull();
	});
});
