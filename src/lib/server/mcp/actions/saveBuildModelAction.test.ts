import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveBuildModelAction } from './saveBuildModelAction';
import type { McpCaller } from '../resolveMcpCaller';

const { tierWritten } = vi.hoisted(() => ({ tierWritten: vi.fn() }));

vi.mock('$lib/server/buildModels/writeBuildModels', () => ({ writeBuildModel: tierWritten }));

const administrator = { isAdmin: true, supabase: {} } as unknown as McpCaller;

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
		expect(tierWritten).not.toHaveBeenCalled();
	});

	it('stores a tier that fits, as the service, and says what it now takes', async () => {
		const answer = await saveBuildModelAction.run(administrator, smallBuilds);
		expect(tierWritten).toHaveBeenCalledWith(administrator.supabase, smallBuilds);
		expect(answer).toContain('Small builds');
	});
});
