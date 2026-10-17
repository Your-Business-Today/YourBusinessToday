import type { SupabaseClient } from '@supabase/supabase-js';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { getLifecycleBadges } from './getLifecycleBadges';

/** What a project's backlog shows of the AIs' work: each card's lifecycle badge and the build models. */
export async function getBuildBoard(supabase: SupabaseClient, projectId: string) {
	const [lifecycleByTask, settings] = await Promise.all([
		getLifecycleBadges(supabase, projectId),
		getBuildModelSettings(supabase)
	]);
	return { lifecycleByTask, buildModels: settings.models };
}
