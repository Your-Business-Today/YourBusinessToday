import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseLifecycleStep, type LifecycleStep } from './lifecycleStepRecord';
import { subjectFilter, type ConversationSubject } from '$lib/server/conversations/conversationSubject';

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
