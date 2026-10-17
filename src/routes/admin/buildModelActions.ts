import { fail } from '@sveltejs/kit';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import {
	removeBuildModel,
	saveBuildModel,
	setReviewModel
} from '$lib/server/buildModels/saveBuildModels';
import { validateBuildModel, validateModelId } from '$lib/data/validateBuildModel';
import { modelIdRule } from '$lib/data/buildModels';
import type { Actions } from './$types';

const badRequestStatus = 400;
const unknownModel = `Choose a model by its id: ${modelIdRule}.`;
const reviewerCannotGo = 'The review model cannot be removed; choose another reviewer first.';

export const buildModelActions: Actions = {
	saveBuildModel: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const model = validateBuildModel({
			modelId: formData.get('modelId'),
			label: formData.get('label'),
			runsOn: formData.get('runsOn'),
			leastPoints: formData.get('leastPoints'),
			mostPoints: formData.get('mostPoints')
		});
		if (typeof model === 'string') return fail(badRequestStatus, { message: model });
		await saveBuildModel(locals.supabase, model);
		return { message: `${model.label} is saved.` };
	},
	removeBuildModel: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const modelId = validateModelId(formData.get('modelId'));
		if (modelId === null) return fail(badRequestStatus, { message: unknownModel });
		const { reviewModelId } = await getBuildModelSettings(locals.supabase);
		const isReviewer = modelId === reviewModelId;
		if (isReviewer) return fail(badRequestStatus, { message: reviewerCannotGo });
		await removeBuildModel(locals.supabase, modelId);
		return { message: `${modelId} no longer takes work.` };
	},
	setReviewModel: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const modelId = validateModelId(formData.get('modelId'));
		if (modelId === null) return fail(badRequestStatus, { message: unknownModel });
		await setReviewModel(locals.supabase, modelId);
		return { message: `${modelId} now reviews local builds.` };
	}
};
