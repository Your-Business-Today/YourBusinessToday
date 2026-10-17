import { modelIdRule, rangePhrase, type BuildModel } from '$lib/data/buildModels';
import { fibonacciStoryPoints } from '$lib/data/storyPoints';
import { saveBuildModel } from '$lib/server/buildModels/saveBuildModels';
import { validateBuildModel } from '$lib/data/validateBuildModel';
import { objectSchema, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const nothingNamed = 'nothing named';

export const saveBuildModelAction: McpAction = {
	name: 'save_build_model',
	area: 'tasks',
	audience: 'admin',
	isWrite: true,
	summary: 'set a build model tier: its label, the model it runs on and the story point range it takes',
	guidance:
		`Only an administrator may call it; the YBT desktop app's Settings screen uses it. The range ` +
		`runs from the smaller size to the larger on the story point scale ${fibonacciStoryPoints.join(', ')}.`,
	inputSchema: objectSchema(
		{
			modelId: textField(`The build model id: ${modelIdRule}`),
			label: textField('The name the tier shows, such as Small builds'),
			runsOn: textField('The model this tier actually runs on, such as Claude Opus 5.5; may be empty'),
			leastPoints: { type: 'integer', description: 'The smallest story point size the tier takes' },
			mostPoints: { type: 'integer', description: 'The largest story point size the tier takes' }
		},
		['modelId', 'label', 'leastPoints', 'mostPoints']
	),
	run: async (caller, input) => {
		const model = validateBuildModel({
			modelId: input.modelId,
			label: input.label,
			runsOn: input.runsOn,
			leastPoints: input.leastPoints,
			mostPoints: input.mostPoints
		});
		if (typeof model === 'string') return model;
		await saveBuildModel(caller.supabase, model);
		return savedSentence(model);
	}
};

function savedSentence(model: BuildModel): string {
	const runsOn = model.runsOn === '' ? nothingNamed : model.runsOn;
	return `${model.label} (${model.modelId}) now runs on ${runsOn} and takes ${rangePhrase(model)}.`;
}
