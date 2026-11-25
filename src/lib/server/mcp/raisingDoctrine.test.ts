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

	it('keeps a bug to one FIX and raises a feature with its chunks as subtasks under one goal', () => {
		expect(raisingDoctrine).toContain('one task is all a bug needs');
		expect(raisingDoctrine).toContain('never as a new top level task');
		expect(raisingDoctrine).toContain('subtasks');
		expect(raisingDoctrine).toContain('credit control');
		expect(raisingDoctrine).toContain('update_goal');
	});

	it('sends infrastructure, cost and new dependencies to Requested as well', () => {
		expect(raisingDoctrine).toContain('infrastructure change or upgrade, costs money');
		expect(raisingDoctrine).toContain('new dependency');
	});
});
