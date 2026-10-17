import { describe, expect, it } from 'vitest';
import { modelForPoints, uncoveredPoints, type BuildModel } from './buildModels';
import { validateBuildModel } from './validateBuildModel';

const tiers: BuildModel[] = [
	{ modelId: 'qwen-local', label: 'Qwen', runsOn: '', leastPoints: 1, mostPoints: 2 },
	{ modelId: 'claude-opus', label: 'Opus', runsOn: '', leastPoints: 3, mostPoints: 8 }
];

describe('build models', () => {
	it('gives a task to the model whose range holds its points', () => {
		expect(modelForPoints(tiers, 5)?.modelId).toBe('claude-opus');
		expect(modelForPoints(tiers, 13)).toBeNull();
	});

	it('names the sizes no model takes', () => {
		expect(uncoveredPoints(tiers)).toEqual([13, 21]);
	});

	it('accepts a model that fits its columns', () => {
		const fields = { modelId: 'claude-fable', label: 'Fable', runsOn: ' Claude Fable 5.1 ', leastPoints: '13', mostPoints: '21' };
		expect(validateBuildModel(fields)).toEqual({
			modelId: 'claude-fable',
			label: 'Fable',
			runsOn: 'Claude Fable 5.1',
			leastPoints: 13,
			mostPoints: 21
		});
	});

	it('refuses a range that is not on the scale or runs downward', () => {
		const offScale = { modelId: 'claude-opus', label: 'Opus', leastPoints: '4', mostPoints: '8' };
		const downward = { modelId: 'claude-opus', label: 'Opus', leastPoints: '8', mostPoints: '3' };
		expect(typeof validateBuildModel(offScale)).toBe('string');
		expect(typeof validateBuildModel(downward)).toBe('string');
	});

	it('refuses a model id the column does not accept', () => {
		const fields = { modelId: 'Claude Opus', label: 'Opus', leastPoints: '3', mostPoints: '8' };
		expect(typeof validateBuildModel(fields)).toBe('string');
	});
});
