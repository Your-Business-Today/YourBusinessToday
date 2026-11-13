import { describe, expect, it } from 'vitest';
import { goalOriginLink } from './portalGoalOrigin';
import { portalContextPath, portalWorkflowMapPath } from '$lib/portal/portalPaths';

describe('the link back from a goal to where it came from', () => {
	it('links a goal raised from a confirmed workflow map back to Your workflow map', () => {
		const origin = goalOriginLink({ contextVersionNumber: null, workflowMap: { stage: 'after', versionNumber: 3 } });
		expect(origin).toEqual({ href: portalWorkflowMapPath, label: 'From your confirmed workflow map, After version 3' });
	});

	it('links a goal raised from a confirmed company context back to it, and links nothing for any other goal', () => {
		expect(goalOriginLink({ contextVersionNumber: 4, workflowMap: null })?.href).toBe(portalContextPath);
		expect(goalOriginLink({ contextVersionNumber: null, workflowMap: null })).toBeNull();
	});
});
