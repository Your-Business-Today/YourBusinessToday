import { buildModelLimits, modelIdPattern, modelIdRule, type BuildModel } from './buildModels';
import { readExactStoryPoints, storyPointsRefusal } from './storyPoints';

const runsOnRefusal = `The model a tier runs on is at most ${buildModelLimits.longestRunsOn} characters.`;

export type BuildModelFields = {
	modelId: unknown;
	label: unknown;
	runsOn?: unknown;
	leastPoints: unknown;
	mostPoints: unknown;
};

/** The build model as given, or a sentence naming the field that does not fit its column. */
export function validateBuildModel(fields: BuildModelFields): BuildModel | string {
	const modelId = String(fields.modelId ?? '').trim();
	if (!modelIdPattern.test(modelId)) return `The model id is ${modelIdRule}.`;
	const label = String(fields.label ?? '').trim();
	const isLabelSized = label !== '' && label.length <= buildModelLimits.longestLabel;
	if (!isLabelSized) return `The label is 1 to ${buildModelLimits.longestLabel} characters.`;
	const runsOn = String(fields.runsOn ?? '').trim();
	if (runsOn.length > buildModelLimits.longestRunsOn) return runsOnRefusal;
	const leastPoints = readExactStoryPoints(fields.leastPoints);
	const mostPoints = readExactStoryPoints(fields.mostPoints);
	if (leastPoints === null || mostPoints === null) return storyPointsRefusal;
	if (leastPoints > mostPoints) return 'The range runs from its smaller size to its larger.';
	return { modelId, label, runsOn, leastPoints, mostPoints };
}

/** A model id the store accepts, or null. */
export function validateModelId(value: unknown): string | null {
	const modelId = String(value ?? '').trim();
	return modelIdPattern.test(modelId) ? modelId : null;
}
