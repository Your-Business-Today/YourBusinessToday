import { describe, expect, it } from 'vitest';
import { mapStage } from '$lib/data/workflowMap/workflowMap';
import { fakeMapDatabase } from './juneMap/fakeMapDatabase';
import { juneWorkflowMapInput } from './juneMap/juneWorkflowMap';
import { fileWorkflowMap } from './fileWorkflowMap';
import { readLatestWorkflowMap } from './readLatestWorkflowMap';
import { validateWorkflowMap } from './validateWorkflowMap';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

const organisationId = '097dd5ab-de8d-46c6-b53f-3f6587b78f3c';
const recordedBy = '94673648-0000-4000-8000-000000000000';

function juneDraft(): WorkflowMapDraft {
	const draft = validateWorkflowMap(juneWorkflowMapInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	return draft;
}

describe('filing the June map of Jewel Bespoke Build and reading it back', () => {
	it('reads back the same six roles, 29 tasks and seven hand-overs, in their order', async () => {
		const supabase = fakeMapDatabase();
		const draft = juneDraft();
		const versionNumber = await fileWorkflowMap(supabase, { organisationId, recordedBy, draft });
		const filed = await readLatestWorkflowMap(supabase, organisationId, mapStage.before);
		expect(versionNumber).toBe(1);
		expect(filed).toEqual({ ...draft, versionNumber: 1, recordedAt: '2026-11-13T05:00:00Z' });
		expect(filed?.lines).toHaveLength(6);
		expect(filed?.lines.flatMap((line) => line.stations)).toHaveLength(29);
		expect(filed?.handovers).toHaveLength(7);
	});

	it('numbers each filing of a stage after the last, and keeps Before and After apart', async () => {
		const supabase = fakeMapDatabase();
		const draft = juneDraft();
		await fileWorkflowMap(supabase, { organisationId, recordedBy, draft });
		const secondBefore = await fileWorkflowMap(supabase, { organisationId, recordedBy, draft });
		const firstAfter = await fileWorkflowMap(supabase, { organisationId, recordedBy, draft: { ...draft, stage: mapStage.after } });
		expect([secondBefore, firstAfter]).toEqual([2, 1]);
		const latestBefore = await readLatestWorkflowMap(supabase, organisationId, mapStage.before);
		expect(latestBefore?.versionNumber).toBe(2);
	});
});
