import { fibonacciStoryPoints } from './storyPoints';

export type BuildModel = {
	modelId: string;
	label: string;
	leastPoints: number;
	mostPoints: number;
};

export type BuildModelSettings = { models: BuildModel[]; reviewModelId: string };

export const buildModelLimits = { longestModelId: 80, longestLabel: 80 };

export const modelIdPattern = /^[a-z0-9][a-z0-9.:_-]{0,79}$/;

export const modelIdRule =
	'lower-case letters, digits, dots, colons, dashes or underscores, up to 80 characters';

export function parseBuildModel(row: Record<string, unknown>): BuildModel {
	return {
		modelId: row.model_id as string,
		label: row.label as string,
		leastPoints: row.least_points as number,
		mostPoints: row.most_points as number
	};
}

export function rangePhrase(model: BuildModel): string {
	const isOneSize = model.leastPoints === model.mostPoints;
	if (isOneSize) return `${model.leastPoints} points`;
	return `${model.leastPoints} to ${model.mostPoints} points`;
}

/** The build model whose range holds these story points, or null when no range does. */
export function modelForPoints(models: BuildModel[], points: number): BuildModel | null {
	const holdsPoints = (model: BuildModel) => model.leastPoints <= points && points <= model.mostPoints;
	return models.find(holdsPoints) ?? null;
}

/** Story point sizes no model takes, so the admin sees a gap in the tiers. */
export function uncoveredPoints(models: BuildModel[]): number[] {
	return fibonacciStoryPoints.filter((points) => modelForPoints(models, points) === null);
}
