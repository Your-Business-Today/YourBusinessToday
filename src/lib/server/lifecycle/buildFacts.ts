import type { SupabaseClient } from '@supabase/supabase-js';
import { badgeOf, type LifecycleBadge } from '$lib/data/lifecycleBadge';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { getLifecycleMarks, type LifecycleMark } from './getLifecycleMarks';
import type { BuildModel } from '$lib/data/buildModels';

/** What the AIs have done on a project's work: each goal's and task's latest step and holder, and the build models. */
export type BuildFacts = { marks: Map<string, LifecycleMark>; buildModels: BuildModel[] };

export async function readBuildFacts(supabase: SupabaseClient, projectId: string): Promise<BuildFacts> {
	const [marks, settings] = await Promise.all([getLifecycleMarks(supabase, [projectId]), getBuildModelSettings(supabase)]);
	return { marks, buildModels: settings.models };
}

/** What a project's backlog shows of the AIs' work: each card's lifecycle badge, keyed by its id, and the build models. */
export function buildBoardOf(facts: BuildFacts) {
	const lifecycleByTask: Record<string, LifecycleBadge> = {};
	for (const [subjectId, mark] of facts.marks) lifecycleByTask[subjectId] = badgeOf(mark);
	return { lifecycleByTask, buildModels: facts.buildModels };
}
