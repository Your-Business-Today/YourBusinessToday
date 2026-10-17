import { rangePhrase, uncoveredPoints, type BuildModel } from '$lib/data/buildModels';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const notSetYet = 'No build models are set yet. An administrator sets them on the admin page.';

export const modelSettingsActions: McpAction[] = [
	{
		name: 'read_model_settings',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the models that build coding tasks, the story point range each takes, and the model that ' +
			'reviews local builds — as set in admin',
		guidance:
			'A task goes to the model whose range holds its story points. The YBT desktop app may narrow ' +
			'the ranges on its own machine; everyone else follows these. Only an administrator changes them.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const { models, reviewModelId } = await getBuildModelSettings(caller.supabase);
			if (models.length === 0) return notSetYet;
			return [
				...models.map(modelLine),
				`Reviews local builds: ${reviewModelId}.`,
				gapLine(models)
			].join('\n');
		}
	}
];

function modelLine(model: BuildModel): string {
	return `- ${model.label} (id: ${model.modelId}) takes ${rangePhrase(model)}`;
}

function gapLine(models: BuildModel[]): string {
	const gaps = uncoveredPoints(models);
	if (gaps.length === 0) return 'Every story point size has a model.';
	return `No model takes ${gaps.join(', ')} points; such a task waits for a person.`;
}
