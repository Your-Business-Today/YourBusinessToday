import { describe, expect, it } from 'vitest';
import { formatWatchMarker, parseWatchMarker } from './watchMarker';

describe('watchMarker', () => {
	it('writes the day and the outcode and reads them back', () => {
		expect(formatWatchMarker({ day: '2026-10-11', outcode: 'KT1' })).toBe('2026-10-11|KT1');
		expect(parseWatchMarker('2026-10-11|KT1')).toEqual({ day: '2026-10-11', outcode: 'KT1' });
		expect(parseWatchMarker('2026-10-11|')).toEqual({ day: '2026-10-11', outcode: '' });
		expect(parseWatchMarker('')).toBeNull();
	});
});
