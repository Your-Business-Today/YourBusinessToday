import { describe, expect, it } from 'vitest';
import { joineryContextInput } from '$lib/server/companyContext/companyContextFixtures';
import { validateCompanyContext } from '$lib/server/companyContext/validateCompanyContext';
import { describeConfirmedContext, notConfirmedYet, type ConfirmedContextAnswer } from './describeConfirmedContext';

function joineryAnswer(): ConfirmedContextAnswer {
	const draft = validateCompanyContext(joineryContextInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	const context = { ...draft, versionNumber: 3, recordedAt: '2026-11-10T17:00:00Z' };
	const confirmation = { versionNumber: 3, confirmedAt: '2026-11-10T18:30:00Z' };
	return {
		organisationName: 'Oak & Ash Joinery',
		confirmed: { versionId: 'version-3', context, confirmation },
		latestVersionNumber: 3,
		projects: [{ id: 'project-1', name: 'Oak & Ash workshop', isOnClientPortal: true }],
		goalsRaised: []
	};
}

describe('the confirmed context as a staff member’s Claude reads it', () => {
	it('names the version to raise services from, and reads the version out whole', () => {
		const text = describeConfirmedContext(joineryAnswer());
		expect(text).toContain('with contextVersionId version-3');
		expect(text).toContain('**Company context of Oak & Ash Joinery, version 3**');
		expect(text).toContain('Confirmed by the client on 2026-11-10');
	});

	it("outlines the services in the offer's order: the harness's sources, then each process", () => {
		const text = describeConfirmedContext(joineryAnswer());
		expect(text).toContain('First, Build your data harness, taking the sources in this order:');
		expect(text).toContain('1. Quote spreadsheet (quote-spreadsheet): creates Quote');
		expect(text).toContain('- Quoting (quoting): serves Estimator');
	});

	it('lists the client’s projects and the goals already raised, so none is raised twice', () => {
		const answer = joineryAnswer();
		const raised = { id: 'goal-1', projectId: 'project-1', title: 'Quotes priced from one place', contextVersionNumber: 2 };
		const text = describeConfirmedContext({ ...answer, goalsRaised: [raised] });
		expect(text).toContain('- Oak & Ash workshop (project id: project-1), on their portal');
		expect(text).toContain('- Quotes priced from one place, on Oak & Ash workshop, from version 2 (goal id: goal-1)');
	});

	it('says when a newer version waits to be confirmed, and when nothing is confirmed yet', () => {
		const text = describeConfirmedContext({ ...joineryAnswer(), latestVersionNumber: 4 });
		expect(text).toContain('Version 4 has been recorded since and is not confirmed yet');
		expect(notConfirmedYet('Oak & Ash Joinery')).toContain('has not confirmed a company context yet');
	});
});
