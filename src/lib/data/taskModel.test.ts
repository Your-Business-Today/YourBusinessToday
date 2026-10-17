import { describe, expect, it } from 'vitest';
import { modelNeededFor } from './taskModel';
import { validateTaskBuildable } from './validateTaskBuildable';
import type { BuildModel } from './buildModels';

const models: BuildModel[] = [
	{ modelId: 'qwen-local', label: 'Qwen', runsOn: '', leastPoints: 1, mostPoints: 2 },
	{ modelId: 'claude-opus', label: 'Opus', runsOn: '', leastPoints: 3, mostPoints: 8 }
];

describe('the model a task needs', () => {
	it('follows the story points when the task names none', () => {
		expect(modelNeededFor({ storyPoints: 2, modelNeeded: null }, models)?.modelId).toBe('qwen-local');
	});

	it('takes the model the task names over its points', () => {
		expect(modelNeededFor({ storyPoints: 2, modelNeeded: 'claude-opus' }, models)?.modelId).toBe('claude-opus');
	});

	it('refuses a model that is not a build model', () => {
		expect(typeof validateTaskBuildable({ isBuildable: true, modelId: 'gpt' }, models)).toBe('string');
		expect(validateTaskBuildable({ isBuildable: true, modelId: '' }, models)).toEqual({
			isBuildable: true,
			modelNeeded: null
		});
	});
});
