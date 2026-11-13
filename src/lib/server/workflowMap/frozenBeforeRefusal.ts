import { beforeFrozenRefusal } from '$lib/data/workflowMap/mapConfirmed';
import { confirmedBeforeOf } from '$lib/data/workflowMap/mapConfirmationsOf';
import { mapStage, type WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import { readConfirmedMapVersions } from './readConfirmedMapVersions';
import type { SupabaseClient } from '@supabase/supabase-js';

type NamedOrganisation = { id: string; name: string };

/** A Before the client confirmed is the business as we found it, so another Before is refused and says why. */
export async function frozenBeforeRefusal(
	supabase: SupabaseClient,
	organisation: NamedOrganisation,
	draft: WorkflowMapDraft
): Promise<string | null> {
	if (draft.stage !== mapStage.before) return null;
	const confirmed = await readConfirmedMapVersions(supabase, organisation.id);
	const confirmedBefore = confirmedBeforeOf(confirmed);
	if (confirmedBefore === null) return null;
	return beforeFrozenRefusal(organisation.name, confirmedBefore.versionNumber);
}
