import type { SupabaseClient } from '@supabase/supabase-js';
import type { BuildModel } from '$lib/data/buildModels';

export async function saveBuildModel(supabase: SupabaseClient, model: BuildModel): Promise<void> {
	const { error } = await supabase.rpc('admin_save_build_model', {
		new_model_id: model.modelId,
		new_label: model.label,
		new_least_points: model.leastPoints,
		new_most_points: model.mostPoints
	});
	if (error) throw error;
}

export async function removeBuildModel(supabase: SupabaseClient, modelId: string): Promise<void> {
	const { error } = await supabase.rpc('admin_remove_build_model', { old_model_id: modelId });
	if (error) throw error;
}

export async function setReviewModel(supabase: SupabaseClient, modelId: string): Promise<void> {
	const { error } = await supabase.rpc('admin_set_review_model', { new_model_id: modelId });
	if (error) throw error;
}
