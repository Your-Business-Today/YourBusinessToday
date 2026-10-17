import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveBuildModelAction } from './saveBuildModelAction';
import type { McpCaller } from '../resolveMcpCaller';

const tierSaved = vi.fn().mockResolvedValue({ error: null });

const administrator = { isAdmin: true, supabase: { rpc: tierSaved } } as unknown as McpCaller;

const smallBuilds = {
	modelId: 'small-builds',
	label: 'Small builds',
	runsOn: 'the quick model',
	leastPoints: 1,
	mostPoints: 3
};

describe('saving a build model tier', () => {
	beforeEach(() => vi.clearAllMocks());

	it('refuses a range that runs from the larger size to the smaller', async () => {
		const backwards = { ...smallBuilds, leastPoints: 8, mostPoints: 3 };
		const answer = await saveBuildModelAction.run(administrator, backwards);
		expect(answer).toBe('The range runs from its smaller size to its larger.');
		expect(tierSaved).not.toHaveBeenCalled();
	});

	it('stores a tier that fits and says what it now takes', async () => {
		const answer = await saveBuildModelAction.run(administrator, smallBuilds);
		expect(tierSaved).toHaveBeenCalledTimes(1);
		expect(tierSaved).toHaveBeenCalledWith('admin_save_build_model', {
			new_model_id: 'small-builds',
			new_label: 'Small builds',
			new_runs_on: 'the quick model',
			new_least_points: 1,
			new_most_points: 3
		});
		expect(answer).toContain('Small builds');
	});
});
