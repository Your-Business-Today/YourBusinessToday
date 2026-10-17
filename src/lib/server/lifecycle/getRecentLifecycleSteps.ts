import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseLifecycleStep, type LifecycleStep } from './lifecycleStepRecord';

export type RecentLifecycleStep = LifecycleStep & { taskTitle: string; goalTitle: string };

/** The newest lifecycle steps across the projects, each with the title of the task or goal it is about. */
export async function getRecentLifecycleSteps(
	supabase: SupabaseClient,
	projectIds: string[],
	limit: number
): Promise<RecentLifecycleStep[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('lifecycle_steps')
		.select('*, tasks(title), goals(title)')
		.in('project_id', projectIds)
		.order('created_at', { ascending: false })
		.limit(limit);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map(parseRecentStep);
}

function parseRecentStep(row: Record<string, unknown>): RecentLifecycleStep {
	return {
		...parseLifecycleStep(row),
		taskTitle: embeddedTitle(row.tasks),
		goalTitle: embeddedTitle(row.goals)
	};
}

function embeddedTitle(embedded: unknown): string {
	const record = (embedded ?? {}) as { title?: unknown };
	return String(record.title ?? '');
}
