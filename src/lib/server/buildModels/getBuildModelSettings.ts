import type { SupabaseClient } from '@supabase/supabase-js';
import { parseBuildModel, type BuildModelSettings } from '$lib/data/buildModels';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

const notYetSet: BuildModelSettings = { models: [], reviewModelId: '' };

/** The build models in order of the work they take, and the one that reviews; empty until 0116 has run. */
export async function getBuildModelSettings(supabase: SupabaseClient): Promise<BuildModelSettings> {
	const models = await supabase
		.from('build_models')
		.select('model_id, label, least_points, most_points')
		.order('least_points');
	if (isSchemaNotYetMigrated(models.error)) return notYetSet;
	if (models.error) throw models.error;
	const reviewer = await supabase.rpc('read_review_model');
	if (isSchemaNotYetMigrated(reviewer.error)) return notYetSet;
	if (reviewer.error) throw reviewer.error;
	return { models: (models.data ?? []).map(parseBuildModel), reviewModelId: reviewer.data ?? '' };
}
