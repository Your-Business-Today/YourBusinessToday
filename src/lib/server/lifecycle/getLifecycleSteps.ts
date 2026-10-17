import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseLifecycleStep, stepSubjectId, type LifecycleStep } from './lifecycleStepRecord';
import { subjectFilter, type ConversationSubject } from '$lib/server/conversations/conversationSubject';

const latestStepsRead = 2000;

/** One goal's or task's lifecycle, oldest step first; empty until migration 0114 has run. */
export async function getLifecycleSteps(
	supabase: SupabaseClient,
	subject: ConversationSubject
): Promise<LifecycleStep[]> {
	const filter = subjectFilter(subject);
	const { data, error } = await supabase
		.from('lifecycle_steps')
		.select('*')
		.eq(filter.column, filter.id)
		.order('created_at', { ascending: true });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map(parseLifecycleStep);
}

/** The latest step of every goal and task on the projects, keyed by the goal's or task's id. */
export async function getLatestLifecycleSteps(
	supabase: SupabaseClient,
	projectIds: string[]
): Promise<Map<string, LifecycleStep>> {
	const latest = new Map<string, LifecycleStep>();
	if (projectIds.length === 0) return latest;
	const { data, error } = await supabase
		.from('lifecycle_steps')
		.select('*')
		.in('project_id', projectIds)
		.order('created_at', { ascending: false })
		.limit(latestStepsRead);
	if (isSchemaNotYetMigrated(error)) return latest;
	if (error) throw error;
	for (const step of (data ?? []).map(parseLifecycleStep)) {
		const subjectId = stepSubjectId(step);
		if (!latest.has(subjectId)) latest.set(subjectId, step);
	}
	return latest;
}
