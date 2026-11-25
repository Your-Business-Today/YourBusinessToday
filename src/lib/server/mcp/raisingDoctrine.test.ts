import { describe, expect, it } from 'vitest';
import { raisingDoctrine } from './raisingDoctrine';

describe('the raising doctrine', () => {
	it('checks a request against the design and sends a design change to YBT before it is built', () => {
		expect(raisingDoctrine).toContain('read_project_site_map');
		expect(raisingDoctrine).toContain('Extends the design');
		expect(raisingDoctrine).toContain('Changes the design');
		expect(raisingDoctrine).toContain('one source of truth');
		expect(raisingDoctrine).toContain('Push back before raising anything');
		expect(raisingDoctrine).toContain('designChange');
		expect(raisingDoctrine).toContain('Requested, awaiting YBT approval');
		expect(raisingDoctrine).toContain('Never guess a request into the first kind');
	});
});
