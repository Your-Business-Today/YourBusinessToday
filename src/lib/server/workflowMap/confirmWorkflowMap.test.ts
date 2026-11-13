import { beforeEach, describe, expect, it, vi } from 'vitest';

const doubles = vi.hoisted(() => {
	const makeDouble = vi.fn;
	return {
		insert: makeDouble(),
		findOrganisationOfClient: makeDouble(),
		findLatestMapVersion: makeDouble(),
		readLatestWorkflowMap: makeDouble(),
		readStationStandings: makeDouble(),
		recordClientEvent: makeDouble(),
		notifyWorkflowMapConfirmed: makeDouble()
	};
});

const service = { from: () => ({ insert: doubles.insert }) };
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => service }));
vi.mock('$lib/server/onboarding/organisationForClient', () => ({ findOrganisationOfClient: doubles.findOrganisationOfClient }));
vi.mock('./findLatestMapVersion', async (original) => ({
	...(await original<typeof import('./findLatestMapVersion')>()),
	findLatestMapVersion: doubles.findLatestMapVersion
}));
vi.mock('./readLatestWorkflowMap', () => ({ readLatestWorkflowMap: doubles.readLatestWorkflowMap }));
vi.mock('./readStationStandings', () => ({ readStationStandings: doubles.readStationStandings }));
vi.mock('$lib/server/clients/recordClientEvent', () => ({ recordClientEvent: doubles.recordClientEvent }));
vi.mock('./notifyWorkflowMapConfirmed', () => ({ notifyWorkflowMapConfirmed: doubles.notifyWorkflowMapConfirmed }));

const { confirmWorkflowMap, mapAlreadyConfirmed } = await import('./confirmWorkflowMap');

const confirmer = { clientId: 'client-1', accountId: 'contact-1', organisationName: 'Oak & Ash Joinery', siteOrigin: 'https://ybt.example' };
const stationOf = (key: string) => ({ key });
const beforeMap = { stage: 'before', versionNumber: 3, lines: [{ stations: [stationOf('quote'), stationOf('invoice')] }], handovers: [] };
const choice = { stage: 'before', versionNumber: 3 } as const;
const marked = (reviewState: string) => ({ reviewState, whatIsWrong: null, markedOnVersion: null });

describe('a client confirming their workflow map', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.findOrganisationOfClient.mockResolvedValue('organisation-1');
		doubles.findLatestMapVersion.mockResolvedValue({ id: 'version-3', versionNumber: 3 });
		doubles.readLatestWorkflowMap.mockResolvedValue(beforeMap);
		doubles.readStationStandings.mockResolvedValue({ quote: marked('right') });
		doubles.insert.mockResolvedValue({ error: null });
	});

	it('keeps the version as confirmed, records it on the client history and emails the staff inbox', async () => {
		expect(await confirmWorkflowMap(confirmer, choice)).toBeNull();
		expect(doubles.insert).toHaveBeenCalledWith({ version_id: 'version-3', confirmed_by: 'contact-1' });
		const detail = { stage: 'before', versionNumber: 3 };
		expect(doubles.recordClientEvent).toHaveBeenCalledWith(service, 'client-1', 'workflow_map_confirmed', detail, 'contact-1');
		expect(doubles.notifyWorkflowMapConfirmed).toHaveBeenCalledWith({
			organisationName: 'Oak & Ash Joinery',
			stage: 'before',
			versionNumber: 3,
			mapUrl: 'https://ybt.example/organisations/organisation-1/workflow-map'
		});
	});

	it('refuses while a station is marked not right, and keeps nothing', async () => {
		doubles.readStationStandings.mockResolvedValue({ quote: marked('right'), invoice: marked('not_right') });
		expect(await confirmWorkflowMap(confirmer, choice)).toEqual({ refusal: expect.stringContaining('1 station is') });
		expect(doubles.insert).not.toHaveBeenCalled();
	});

	it('refuses a version older than the latest, so a new filing is confirmed only once it is seen', async () => {
		expect(await confirmWorkflowMap(confirmer, { ...choice, versionNumber: 2 })).toEqual({
			refusal: expect.stringContaining('Version 3')
		});
		expect(doubles.insert).not.toHaveBeenCalled();
	});

	it('tells nobody twice when the version is already confirmed', async () => {
		doubles.insert.mockResolvedValue({ error: { code: '23505' } });
		expect(await confirmWorkflowMap(confirmer, choice)).toEqual(mapAlreadyConfirmed);
		expect(doubles.recordClientEvent).not.toHaveBeenCalled();
		expect(doubles.notifyWorkflowMapConfirmed).not.toHaveBeenCalled();
	});

	it('refuses when no map of that stage has been filed yet', async () => {
		doubles.findLatestMapVersion.mockResolvedValue(null);
		expect(await confirmWorkflowMap(confirmer, choice)).toEqual({ refusal: expect.stringContaining('nothing to confirm') });
	});
});
