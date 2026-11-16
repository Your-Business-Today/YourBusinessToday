import { describe, expect, it, vi } from 'vitest';
import { fakeMapDatabase } from '$lib/server/workflowMap/juneMap/fakeMapDatabase';
import { juneDraft } from '$lib/server/workflowMap/juneMap/juneDraft';
import { fileWorkflowMap } from '$lib/server/workflowMap/fileWorkflowMap';
import { readMapContents } from '$lib/server/workflowMap/readMapContents';
import { readLatestWorkflowMap } from '$lib/server/workflowMap/readLatestWorkflowMap';
import { amendWorkflowMapAction } from './amendWorkflowMapAction';
import type { McpCaller } from '../resolveMcpCaller';

const organisationId = '097dd5ab-de8d-46c6-b53f-3f6587b78f3c';
const jewel = { id: organisationId, name: 'Jewel Bespoke Build' };

vi.mock('./contextOrganisation', () => ({
	contextOrganisation: async () => jewel
}));
vi.mock('$lib/server/workflowMap/frozenBeforeRefusal', () => ({
	frozenBeforeRefusal: async () => null
}));
vi.mock('$lib/server/workflowMap/mapProducts', () => ({
	refuseStrayProducts: async () => null
}));
vi.mock('$lib/server/businessBrain/readMapVocabulary', () => ({
	readMapVocabulary: async () => ({ things: [], words: [] })
}));

async function filedJuneMap(): Promise<McpCaller> {
	const supabase = fakeMapDatabase();
	await fileWorkflowMap(supabase, {
		organisationId,
		recordedBy: 'james',
		draft: juneDraft()
	});
	return { accountId: 'james', supabase } as unknown as McpCaller;
}

async function readVersion(caller: McpCaller, versionNumber: number) {
	const { data } = await caller.supabase.from('workflow_map_versions').select('*').eq('version_number', versionNumber).maybeSingle();
	return readMapContents(caller.supabase, data);
}

const checkedCover = {
	key: 'insurance-cis-checks',
	name: 'Insurance & CIS checks',
	summary: 'The portal checks cover before any award.'
};

describe('amending a workflow map through the connector', () => {
	it('files the amendment as version 2 and leaves version 1 as it was', async () => {
		const caller = await filedJuneMap();
		const answer = await amendWorkflowMapAction.run(caller, {
			organisationId,
			stage: 'before',
			stations: [checkedCover]
		});
		expect(answer).toContain("Filed version 2 of Jewel Bespoke Build's Before map");
		expect(answer).toContain('Replaced: station "insurance-cis-checks".');
		const latest = await readLatestWorkflowMap(caller.supabase, organisationId, 'before');
		expect(latest?.lines[0].stations[1].summary).toBe(checkedCover.summary);
		expect(latest?.lines.slice(1)).toEqual(juneDraft().lines.slice(1));
		const first = await readVersion(caller, 1);
		expect(first.versionNumber).toBe(1);
		expect(first.lines).toEqual(juneDraft().lines);
	});

	it('says which hand-overs went with a removed station', async () => {
		const caller = await filedJuneMap();
		const answer = await amendWorkflowMapAction.run(caller, {
			organisationId,
			stage: 'before',
			removeStations: ['cost-capture']
		});
		expect(answer).toContain('Removed: station "cost-capture". Removed with them: hand-over cost-capture to cvr.');
	});

	it('refuses an amendment to a stage with no map filed, and a value that does not fit, before filing anything', async () => {
		const caller = await filedJuneMap();
		const noAfter = await amendWorkflowMapAction.run(caller, {
			organisationId,
			stage: 'after',
			stations: [checkedCover]
		});
		expect(noAfter).toContain('no After map filed yet');
		const badKey = await amendWorkflowMapAction.run(caller, {
			organisationId,
			stage: 'before',
			removeLines: ['Finance Director']
		});
		expect(badKey).toContain('Line to remove 1 must be lower-case words joined by hyphens');
		const latest = await readLatestWorkflowMap(caller.supabase, organisationId, 'before');
		expect(latest?.versionNumber).toBe(1);
	});
});
