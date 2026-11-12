import { deleteBuildModel, writeReviewModel } from '$lib/server/buildModels/writeBuildModels';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { modelIdRule } from '$lib/data/buildModels';
import { objectSchema, textField } from '../actionTypes';
import { validateModelId } from '$lib/data/validateBuildModel';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const unknownModel = `Choose a model by its id: ${modelIdRule}.`;
const reviewerCannotGo = 'The review model cannot be removed; choose another reviewer first.';
const notABuildModel = 'The review model must be one of the build models. Call read_model_settings to see them.';
const noSuchBuildModel = 'No build model has that id. Call read_model_settings to see them.';
const modelIdField = textField('The build model id, as read_model_settings gives it');

export const buildModelAdminActions: McpAction[] = [
	{
		name: 'remove_build_model',
		area: 'tasks',
		audience: 'admin',
		isWrite: true,
		summary: 'take a build model tier out so it takes no more work — never the one that reviews local builds',
		inputSchema: objectSchema({ modelId: modelIdField }, ['modelId']),
		run: async (caller, input) => removeModel(caller, input.modelId)
	},
	{
		name: 'set_review_model',
		area: 'tasks',
		audience: 'admin',
		isWrite: true,
		summary: 'choose which build model reviews local builds',
		inputSchema: objectSchema({ modelId: modelIdField }, ['modelId']),
		run: async (caller, input) => chooseReviewer(caller, input.modelId)
	}
];

async function removeModel(caller: McpCaller, value: unknown): Promise<string> {
	const modelId = validateModelId(value);
	if (modelId === null) return unknownModel;
	const { models, reviewModelId } = await getBuildModelSettings(caller.supabase);
	if (modelId === reviewModelId) return reviewerCannotGo;
	const isSaved = models.some((model) => model.modelId === modelId);
	if (!isSaved) return noSuchBuildModel;
	await deleteBuildModel(caller.supabase, modelId);
	return `${modelId} no longer takes work.`;
}

async function chooseReviewer(caller: McpCaller, value: unknown): Promise<string> {
	const modelId = validateModelId(value);
	if (modelId === null) return unknownModel;
	const { models } = await getBuildModelSettings(caller.supabase);
	const isSaved = models.some((model) => model.modelId === modelId);
	if (!isSaved) return notABuildModel;
	await writeReviewModel(caller.supabase, modelId);
	return `${modelId} now reviews local builds.`;
}
