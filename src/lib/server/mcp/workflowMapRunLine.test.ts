import { describe, expect, it } from 'vitest';
import { olderOnePromptOpening, onePromptOpening } from '$lib/onboarding/onboarding';
import { workflowMapRunLine } from './workflowMapRunLine';

const membership = { organisationId: 'org-1', accountId: 'account-1', isManager: false };

describe('what get_current_context tells a person who runs the one prompt or says "map the workflows"', () => {
	it('tells them to start a workflow map run of each organisation they are on', () => {
		const line = workflowMapRunLine([membership], () => 'Oak & Ash Joinery');
		expect(line).toContain('as "map the workflows" asks');
		expect(line).toContain('run_read_action with start_workflow_map_run');
		expect(line).toContain('Oak & Ash Joinery (org-1)');
	});

	it('answers the one prompt the same in the wording it has now and the wording people already hold', () => {
		const line = workflowMapRunLine([membership], () => 'Oak & Ash Joinery');
		expect(line).toContain(onePromptOpening);
		expect(line).toContain(olderOnePromptOpening);
	});

	it('says nothing to someone on no organisation', () => {
		expect(workflowMapRunLine([], () => '')).toBeNull();
	});
});
