import { describe, expect, it, vi } from 'vitest';
import {
	anotherOrganisationsMap,
	mapLinkSentence,
	noSuchConfirmedMap,
	onlyStaffRaiseMapServices,
	readGoalMapLink
} from './goalWorkflowMapVersion';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

const confirmedVersionId = '11111111-1111-4111-8111-111111111111';
const unconfirmedVersionId = '22222222-2222-4222-8222-222222222222';
const clientOrganisationId = 'organisation-oak-and-ash';
const confirmed = {
	id: confirmedVersionId,
	organisationId: clientOrganisationId,
	stage: 'after',
	versionNumber: 2,
	confirmedAt: '2026-11-13T07:00:00Z'
};

vi.mock('$lib/server/workflowMap/readConfirmedMapVersions', () => ({
	findConfirmedMapVersion: async (_supabase: unknown, versionId: string) => (versionId === confirmedVersionId ? confirmed : null)
}));

const staff = { isStaff: true, supabase: {} } as unknown as McpCaller;
const clientProject = { id: 'project-1', organisationId: clientOrganisationId } as Project;

describe('the confirmed workflow map a goal is raised from', () => {
	it('links nothing when no version is given, as for any other goal', async () => {
		expect(await readGoalMapLink(staff, clientProject, {})).toEqual({});
	});

	it('links a confirmed version of the project’s own organisation, and says so', async () => {
		const link = await readGoalMapLink(staff, clientProject, { workflowMapVersionId: confirmedVersionId });
		expect(link).toEqual({ workflowMapVersionId: confirmedVersionId, confirmed });
		expect(mapLinkSentence(link)).toContain("the After version 2 of the client's confirmed workflow map");
	});

	it('refuses anyone but staff', async () => {
		const client = { ...staff, isStaff: false } as McpCaller;
		const link = await readGoalMapLink(client, clientProject, { workflowMapVersionId: confirmedVersionId });
		expect(link).toEqual({ refusal: onlyStaffRaiseMapServices });
	});

	it('refuses a value that is not an id, a version not confirmed, and another organisation’s map', async () => {
		expect(await readGoalMapLink(staff, clientProject, { workflowMapVersionId: 'version 2' })).toHaveProperty('refusal');
		const unconfirmed = await readGoalMapLink(staff, clientProject, { workflowMapVersionId: unconfirmedVersionId });
		expect(unconfirmed).toEqual({ refusal: noSuchConfirmedMap });
		const otherProject = { ...clientProject, organisationId: 'organisation-elsewhere' };
		const elsewhere = await readGoalMapLink(staff, otherProject, { workflowMapVersionId: confirmedVersionId });
		expect(elsewhere).toEqual({ refusal: anotherOrganisationsMap });
	});
});
