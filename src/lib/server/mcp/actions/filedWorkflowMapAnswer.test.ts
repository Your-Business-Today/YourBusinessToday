import { describe, expect, it } from 'vitest';
import { filedWorkflowMapAnswer } from './filedWorkflowMapAnswer';
import { domainRunActionName } from './domainRunActionName';
import { organisationDomainRequest } from '$lib/data/personRequests';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import type { MapQuestion } from '$lib/data/workflowMap/mapQuestions';

const draft: WorkflowMapDraft = {
	stage: 'after',
	lines: [{ key: 'office', name: 'Office', kind: 'role', stations: [] }],
	handovers: [],
	arrivals: []
};

describe('the answer to filing a workflow map', () => {
	const answer = filedWorkflowMapAnswer('Board', 2, draft, []);

	it('says which version was filed and how big it is', () => {
		expect(answer).toContain("Filed version 2 of Board's After map: 1 lines, 0 stations, 0 hand-overs and 0 arrivals.");
	});

	it('points on to setting the organisation domain', () => {
		expect(answer).toContain(organisationDomainRequest);
		expect(answer).toContain(domainRunActionName);
	});

	it('says the map passes every test when nothing is left open', () => {
		expect(answer).toContain('It passes every test of a complete map.');
	});

	it('says how many questions are still open and gives the first three, most important first', () => {
		const questions: MapQuestion[] = ['First?', 'Second?', 'Third?', 'Fourth?'].map((question) => ({
			kind: 'source', question, stationKey: null, stationName: null, lineKey: null, lineName: null
		}));
		const withQuestions = filedWorkflowMapAnswer('Board', 2, draft, questions);
		expect(withQuestions).toContain('4 questions are still open, most important first: 1. First? 2. Second? 3. Third? start_workflow_map_run lists them all');
		expect(withQuestions).not.toContain('Fourth?');
	});
});
