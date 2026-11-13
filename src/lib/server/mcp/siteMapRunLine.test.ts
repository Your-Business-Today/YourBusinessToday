import { describe, expect, it } from 'vitest';
import { siteMapRequest } from '$lib/data/personRequests';
import { siteMapRunLine } from './siteMapRunLine';
describe('what get_current_context tells a person about mapping a site', () => {
	it('points "map the site" to the site map run', () => {
		const line = siteMapRunLine(['product-1']);
		expect(line).toContain(`"${siteMapRequest}"`);
		expect(line).toContain('run_read_action with start_site_map_run and the projectId');
	});

	it('says nothing to a person on no product', () => {
		expect(siteMapRunLine([])).toBeNull();
	});
});
