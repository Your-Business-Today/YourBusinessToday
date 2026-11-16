import { frozenBeforeRefusal } from '$lib/server/workflowMap/frozenBeforeRefusal';
import { fileWorkflowMap } from '$lib/server/workflowMap/fileWorkflowMap';
import { refuseStrayProducts } from '$lib/server/workflowMap/mapProducts';
import { workflowMapGaps } from '$lib/server/workflowMap/workflowMapGaps';
import { readMapVocabulary } from '$lib/server/businessBrain/readMapVocabulary';
import type { MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export type FiledMap = { versionNumber: number; questions: MapQuestion[] };

/** Files a validated version once a confirmed Before and the products it names allow it, with the questions it still leaves open. */
export async function fileCheckedWorkflowMap(caller: McpCaller, organisation: Organisation, draft: WorkflowMapDraft): Promise<FiledMap | string> {
	const frozen = await frozenBeforeRefusal(caller.supabase, organisation, draft);
	if (frozen !== null) return frozen;
	const strayProduct = await refuseStrayProducts(caller.supabase, organisation.id, draft);
	if (strayProduct !== null) return strayProduct.refusal;
	const filing = {
		organisationId: organisation.id,
		recordedBy: caller.accountId,
		draft
	};
	const versionNumber = await fileWorkflowMap(caller.supabase, filing);
	const vocabulary = await readMapVocabulary(caller.supabase, organisation.id);
	return { versionNumber, questions: workflowMapGaps(draft, vocabulary) };
}
