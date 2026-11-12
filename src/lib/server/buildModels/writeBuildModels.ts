import type { SupabaseClient } from '@supabase/supabase-js';
import type { BuildModel } from '$lib/data/buildModels';

const reviewModelSetting = 'review_model';

/** Writes a build model tier as the service; the admin page does the same through admin_save_build_model as the signed-in admin. */
export async function writeBuildModel(supabase: SupabaseClient, model: BuildModel): Promise<void> {
	const row = {
		model_id: model.modelId,
		label: model.label,
		runs_on: model.runsOn,
		least_points: model.leastPoints,
		most_points: model.mostPoints,
		updated_at: new Date().toISOString()
	};
	const { error } = await supabase.from('build_models').upsert(row, { onConflict: 'model_id' });
	if (error) throw error;
}

/** Takes a build model tier out as the service; the caller has checked it is not the reviewer. */
export async function deleteBuildModel(supabase: SupabaseClient, modelId: string): Promise<void> {
	const { error } = await supabase.from('build_models').delete().eq('model_id', modelId);
	if (error) throw error;
}

/** Names the build model that reviews local builds, as the service; the caller has checked it is one of the build models. */
export async function writeReviewModel(supabase: SupabaseClient, modelId: string): Promise<void> {
	const { error } = await supabase
		.from('site_settings')
		.update({ setting_value: modelId, updated_at: new Date().toISOString() })
		.eq('setting_name', reviewModelSetting);
	if (error) throw error;
}
