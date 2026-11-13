import { beforeEach, describe, expect, it, vi } from 'vitest';
import { juneWorkflowMapInput } from '$lib/server/workflowMap/juneMap/juneWorkflowMap';
import { noWorkflowMapFiledYet, portalWorkflowMapActions } from './portalWorkflowMapActions';
import { notAClientContact } from '../clientContactAccess';
import { notYourOrganisation } from '../portalVisitorAccess';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import type { McpCaller } from '../resolveMcpCaller';

const acmeId = '11111111-1111-4111-8111-111111111111';
const betaId = '22222222-2222-4222-8222-222222222222';
const contact = { accountId: 'contact-1', supabase: {} } as unknown as McpCaller;

const { portal, mapOfClient, marking } = vi.hoisted(() => ({
	portal: { visitor: null as Record<string, unknown> | null },
	mapOfClient: { reading: null as Record<string, unknown> | null, readFor: [] as string[] },
	marking: vi.fn()
}));

vi.mock('$lib/server/portal/getPortalVisitor', () => ({
	getPortalVisitor: async (_supabase: unknown, _accountId: string, chosenClientId: string | null) => {
		if (portal.visitor === null || chosenClientId !== betaId) return portal.visitor;
		return { ...portal.visitor, clientId: betaId, organisationName: 'Beta Ltd' };
	}
}));
vi.mock('$lib/server/workflowMap/readWorkflowMapOfClient', () => ({
	readWorkflowMapOfClient: async (clientId: string) => {
		mapOfClient.readFor.push(clientId);
		return mapOfClient.reading;
	}
}));
vi.mock('$lib/server/workflowMap/markWorkflowMapStation', () => ({ markWorkflowMapStation: marking }));
vi.mock('$lib/server/workflowMap/confirmWorkflowMap', () => ({ confirmWorkflowMap: vi.fn() }));

const organisations = [{ clientId: acmeId, name: 'Acme Ltd' }, { clientId: betaId, name: 'Beta Ltd' }];
const acmeVisitor = { clientId: acmeId, organisationName: 'Acme Ltd', organisations };

function juneAfter() {
	const draft = validateWorkflowMap({ ...juneWorkflowMapInput(), stage: 'after' });
	if ('refusal' in draft) throw new Error(draft.refusal);
	return { ...draft, versionNumber: 2, recordedAt: '2026-11-13T05:00:00Z' };
}

function run(name: string, input: Record<string, unknown> = {}) {
	const action = portalWorkflowMapActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(contact, input);
}

const confirmedAfter = { stage: 'after', versionNumber: 2, confirmedAt: '2026-11-13T07:00:00Z' };
const notRightMark = { stage: 'after', versionNumber: 2, stationKey: 'pvr', reviewState: 'not_right', whatIsWrong: 'It goes to the client too.' };

describe("a client contact's workflow map through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		portal.visitor = acmeVisitor;
		mapOfClient.readFor = [];
		const standings = { before: {}, after: { pvr: { reviewState: 'not_right', whatIsWrong: 'It goes to the client too.', markedOnVersion: null } } };
		const maps = { before: null, after: juneAfter(), productNames: {} };
		mapOfClient.reading = { maps, standings, confirmations: { before: null, after: confirmedAfter } };
		marking.mockResolvedValue(null);
	});

	it("reads only the map of the organisation they are at, with each station's standing", async () => {
		const answer = String(await run('read_my_workflow_map'));
		expect(mapOfClient.readFor).toEqual([acmeId]);
		expect(answer).toContain(`For Acme Ltd (clientId ${acmeId}).`);
		expect(answer).toContain('## After: workflow map of Acme Ltd, version 2, filed 2026-11-13');
		expect(answer).toContain("   - Client's mark: not right: It goes to the client too.");
		expect(answer).not.toContain('## Before');
		expect(answer).toContain('The client confirmed version 2 of their After map as right on 13 Nov 2026.');
	});

	it('acts for the organisation named, and never reads one they are not at', async () => {
		await run('read_my_workflow_map', { clientId: betaId });
		expect(mapOfClient.readFor).toEqual([betaId]);
		expect(await run('read_my_workflow_map', { clientId: '33333333-3333-4333-8333-333333333333' })).toBe(notYourOrganisation);
		expect(mapOfClient.readFor).toEqual([betaId]);
	});

	it('says when no map is filed yet, and when the caller is not a client contact', async () => {
		mapOfClient.reading = { ...mapOfClient.reading, maps: { before: null, after: null, productNames: {} } };
		expect(await run('read_my_workflow_map')).toContain(noWorkflowMapFiledYet);
		portal.visitor = null;
		expect(await run('read_my_workflow_map')).toBe(notAClientContact);
		expect(await run('mark_workflow_map_station', notRightMark)).toBe(notAClientContact);
	});

	it('marks a station as the person says, for their own organisation only', async () => {
		const answer = await run('mark_workflow_map_station', notRightMark);
		expect(answer).toBe("Marked pvr not right: It goes to the client too. on version 2 of Acme Ltd's After workflow map.");
		expect(marking).toHaveBeenCalledWith({ clientId: acmeId, accountId: 'contact-1' }, { ...notRightMark });
	});

	it('refuses a mark that does not fit before writing, and passes on what the map refuses', async () => {
		expect(await run('mark_workflow_map_station', { ...notRightMark, whatIsWrong: '' })).toContain('Say what is wrong');
		expect(marking).not.toHaveBeenCalled();
		marking.mockResolvedValue({ refusal: 'That station is not on this version of your workflow map.' });
		expect(await run('mark_workflow_map_station', notRightMark)).toBe('That station is not on this version of your workflow map.');
	});
});
