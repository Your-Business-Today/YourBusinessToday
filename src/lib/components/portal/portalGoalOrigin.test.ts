import { describe, expect, it } from 'vitest';
import { goalOriginLink } from './portalGoalOrigin';
import { portalWorkflowMapPath } from '$lib/portal/portalPaths';

describe('the link back from a goal to where it came from', () => {
	it('links a goal raised from a confirmed workflow map back to Your workflow map', () => {
		const origin = goalOriginLink({ workflowMap: { stage: 'after', versionNumber: 3 } });
		expect(origin).toEqual({ href: portalWorkflowMapPath, label: 'From your confirmed workflow map, After version 3' });
	});

	it('links nothing for a goal raised any other way', () => {
		expect(goalOriginLink({ workflowMap: null })).toBeNull();
	});
});
