import type { BuildModel } from './buildModels';

export type TaskBuildableFields = { isBuildable: unknown; modelId: unknown };

export type TaskBuildableInput = { isBuildable: boolean; modelNeeded: string | null };

/** The tag and model as given, or a sentence naming what does not fit: the model must be a build model. */
export function validateTaskBuildable(
	fields: TaskBuildableFields,
	models: BuildModel[]
): TaskBuildableInput | string {
	if (typeof fields.isBuildable !== 'boolean') return 'isBuildable is true or false.';
	const modelId = String(fields.modelId ?? '').trim();
	if (modelId === '') return { isBuildable: fields.isBuildable, modelNeeded: null };
	const isBuildModel = models.some((model) => model.modelId === modelId);
	if (!isBuildModel) return `${modelId} is not a build model. read_model_settings lists them.`;
	return { isBuildable: fields.isBuildable, modelNeeded: modelId };
}
