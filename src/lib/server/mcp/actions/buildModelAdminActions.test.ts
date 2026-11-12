import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildModelAdminActions } from './buildModelAdminActions';
import type { McpCaller } from '../resolveMcpCaller';

const administrator = { isAdmin: true, supabase: {} } as unknown as McpCaller;

const { tierDeleted, reviewerWritten } = vi.hoisted(() => ({ tierDeleted: vi.fn(), reviewerWritten: vi.fn() }));

vi.mock('$lib/server/buildModels/writeBuildModels', () => ({ deleteBuildModel: tierDeleted, writeReviewModel: reviewerWritten }));
vi.mock('$lib/server/buildModels/getBuildModelSettings', () => ({
	getBuildModelSettings: async () => ({
		models: [
			{ modelId: 'qwen-local', label: 'Qwen', runsOn: '', leastPoints: 1, mostPoints: 2 },
			{ modelId: 'claude-opus', label: 'Opus', runsOn: '', leastPoints: 3, mostPoints: 8 }
		],
		reviewModelId: 'claude-opus'
	})
}));

function run(name: string, input: Record<string, unknown>) {
	const action = buildModelAdminActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(administrator, input);
}

describe('the build model tiers through the connector', () => {
	beforeEach(() => vi.clearAllMocks());

	it('takes a tier out, but never the reviewer or one that is not saved', async () => {
		expect(await run('remove_build_model', { modelId: 'qwen-local' })).toBe('qwen-local no longer takes work.');
		expect(tierDeleted).toHaveBeenCalledWith(administrator.supabase, 'qwen-local');
		expect(await run('remove_build_model', { modelId: 'claude-opus' })).toBe('The review model cannot be removed; choose another reviewer first.');
		expect(await run('remove_build_model', { modelId: 'gpt' })).toContain('No build model has that id');
		expect(await run('remove_build_model', { modelId: 'Not An Id' })).toContain('Choose a model by its id');
		expect(tierDeleted).toHaveBeenCalledTimes(1);
	});

	it('chooses the reviewer from the build models', async () => {
		expect(await run('set_review_model', { modelId: 'qwen-local' })).toBe('qwen-local now reviews local builds.');
		expect(reviewerWritten).toHaveBeenCalledWith(administrator.supabase, 'qwen-local');
		expect(await run('set_review_model', { modelId: 'gpt' })).toContain('must be one of the build models');
		expect(reviewerWritten).toHaveBeenCalledTimes(1);
	});
});
