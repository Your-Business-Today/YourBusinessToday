import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseLifecycleStep, stepSubjectId, type LifecycleStep } from './lifecycleStepRecord';
import { standingClaim, type Claim } from '$lib/data/lifecycleClaim';

const newestStepsRead = 2000;

export type LifecycleMark = { latest: LifecycleStep; claim: Claim | null };

/** Each goal's and task's latest step on the projects, and who holds it now, keyed by its id. */
export async function getLifecycleMarks(
	supabase: SupabaseClient,
	projectIds: string[]
): Promise<Map<string, LifecycleMark>> {
	const marks = new Map<string, LifecycleMark>();
	if (projectIds.length === 0) return marks;
	const { data, error } = await supabase
		.from('lifecycle_steps')
		.select('*')
		.in('project_id', projectIds)
		.order('created_at', { ascending: false })
		.limit(newestStepsRead);
	if (isSchemaNotYetMigrated(error)) return marks;
	if (error) throw error;
	const now = new Date();
	for (const [subjectId, steps] of stepsBySubject((data ?? []).map(parseLifecycleStep).reverse())) {
		marks.set(subjectId, { latest: steps[steps.length - 1], claim: standingClaim(steps, now) });
	}
	return marks;
}

function stepsBySubject(steps: LifecycleStep[]): Map<string, LifecycleStep[]> {
	const grouped = new Map<string, LifecycleStep[]>();
	for (const step of steps) {
		const subjectId = stepSubjectId(step);
		grouped.set(subjectId, [...(grouped.get(subjectId) ?? []), step]);
	}
	return grouped;
}
