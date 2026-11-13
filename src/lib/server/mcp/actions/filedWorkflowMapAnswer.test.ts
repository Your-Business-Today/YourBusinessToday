import { describe, expect, it } from 'vitest';
import { filedWorkflowMapAnswer } from './filedWorkflowMapAnswer';
import { domainRunActionName } from './domainRunActionName';
import { organisationDomainRequest } from '$lib/data/personRequests';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

const draft: WorkflowMapDraft = {
	stage: 'after',
	lines: [{ key: 'office', name: 'Office', kind: 'role', stations: [] }],
	handovers: [],
	arrivals: []
};

describe('the answer to filing a workflow map', () => {
	const answer = filedWorkflowMapAnswer('Board', 2, draft);

	it('says which version was filed and how big it is', () => {
		expect(answer).toContain("Filed version 2 of Board's After map: 1 lines, 0 stations, 0 hand-overs and 0 arrivals.");
	});

	it('points on to setting the organisation domain', () => {
		expect(answer).toContain(organisationDomainRequest);
		expect(answer).toContain(domainRunActionName);
	});
});
