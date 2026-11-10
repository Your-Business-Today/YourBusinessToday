import { describe, expect, it, vi } from 'vitest';
import {
	anotherOrganisationsContext,
	contextLinkSentence,
	noSuchConfirmedVersion,
	onlyStaffRaiseServices,
	readGoalContextLink
} from './goalContextVersion';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

const confirmedVersionId = '11111111-1111-4111-8111-111111111111';
const unconfirmedVersionId = '22222222-2222-4222-8222-222222222222';
const clientOrganisationId = 'organisation-oak-and-ash';

vi.mock('$lib/server/companyContext/findConfirmedVersion', () => ({
	findConfirmedVersion: async (_supabase: unknown, versionId: string) => {
		if (versionId !== confirmedVersionId) return null;
		return { id: versionId, organisationId: clientOrganisationId, versionNumber: 4 };
	}
}));

const staff = { isStaff: true, supabase: {} } as unknown as McpCaller;
const clientProject = { id: 'project-1', organisationId: clientOrganisationId } as Project;

describe('the confirmed context a goal is raised from', () => {
	it('links nothing when no version is given, as for any other goal', async () => {
		expect(await readGoalContextLink(staff, clientProject, {})).toEqual({});
	});

	it('links a confirmed version of the project’s own organisation, and says so', async () => {
		const link = await readGoalContextLink(staff, clientProject, { contextVersionId: confirmedVersionId });
		expect(link).toEqual({ contextVersionId: confirmedVersionId, versionNumber: 4 });
		expect(contextLinkSentence(link)).toContain("version 4 of the client's confirmed company context");
	});

	it('refuses anyone but staff', async () => {
		const client = { ...staff, isStaff: false } as McpCaller;
		const link = await readGoalContextLink(client, clientProject, { contextVersionId: confirmedVersionId });
		expect(link).toEqual({ refusal: onlyStaffRaiseServices });
	});

	it('refuses a value that is not an id, a version not confirmed, and another organisation’s context', async () => {
		const notAnId = await readGoalContextLink(staff, clientProject, { contextVersionId: 'version 4' });
		expect(notAnId).toHaveProperty('refusal');
		const unconfirmed = await readGoalContextLink(staff, clientProject, { contextVersionId: unconfirmedVersionId });
		expect(unconfirmed).toEqual({ refusal: noSuchConfirmedVersion });
		const otherProject = { ...clientProject, organisationId: 'organisation-elsewhere' };
		const elsewhere = await readGoalContextLink(staff, otherProject, { contextVersionId: confirmedVersionId });
		expect(elsewhere).toEqual({ refusal: anotherOrganisationsContext });
	});
});
