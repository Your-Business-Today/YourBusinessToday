import { validateWorkflowMap } from '../validateWorkflowMap';
import { juneWorkflowMapInput } from './juneWorkflowMap';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** The June map of Jewel Bespoke Build, validated as a draft ready to file. */
export function juneDraft(): WorkflowMapDraft {
	const draft = validateWorkflowMap(juneWorkflowMapInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	return draft;
}
