import { modelForPoints, type BuildModel } from './buildModels';

export type TaskModelFields = { storyPoints: number; modelNeeded: string | null };

/** The model a task needs: the one it names, or the one whose range holds its story points. */
export function modelNeededFor(task: TaskModelFields, models: BuildModel[]): BuildModel | null {
	const named = models.find((model) => model.modelId === task.modelNeeded);
	if (named !== undefined) return named;
	return modelForPoints(models, task.storyPoints);
}

/** "Buildable by Claude Opus (from its 5 points)" */
export function buildableSentence(isBuildable: boolean, task: TaskModelFields, models: BuildModel[]): string {
	if (!isBuildable) return 'Not tagged buildable, so no model takes it unattended.';
	const model = modelNeededFor(task, models);
	if (model === null) return `Buildable, but no model takes ${task.storyPoints} points yet.`;
	const reason = task.modelNeeded === null ? `from its ${task.storyPoints} points` : 'named on the task';
	return `Buildable by ${model.label} (${reason}).`;
}
