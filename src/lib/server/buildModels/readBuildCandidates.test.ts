import { describe, expect, it } from 'vitest';
import { designReviewStates } from '$lib/data/designReview';
import { readBuildCandidates } from './readBuildCandidates';
import type { SupabaseClient } from '@supabase/supabase-js';

function buildableRow(id: string, designReviewState: string | null): Record<string, unknown> {
	return {
		id,
		project_id: 'project-1',
		title: `Task ${id}`,
		status: 'backlog',
		is_buildable: true,
		global_priority: 1,
		design_review_state: designReviewState,
		project: { name: 'Harbour site' },
		goal: null,
		waits_for: null,
		parent: null
	};
}

function databaseHolding(rows: Record<string, unknown>[]): SupabaseClient {
	const answer = { data: rows, error: null };
	const query: Record<string, unknown> = {};
	for (const step of ['select', 'in', 'eq', 'neq', 'order']) query[step] = () => query;
	query.limit = () => Promise.resolve(answer);
	return { from: () => query } as unknown as SupabaseClient;
}

describe('readBuildCandidates', () => {
	it('never hands out a task waiting for YBT to approve a design change, or one YBT turned down', async () => {
		const rows = [
			buildableRow('extends', null),
			buildableRow('waiting', designReviewStates.awaiting),
			buildableRow('turned-down', designReviewStates.rejected),
			buildableRow('approved', designReviewStates.approved)
		];
		const candidates = await readBuildCandidates(databaseHolding(rows), ['project-1']);
		expect(candidates.map(({ task }) => task.id)).toEqual(['extends', 'approved']);
	});

	it('holds a subtask while the feature it is a chunk of waits for YBT', async () => {
		const heldParent = { global_priority: 1, title: 'Statements', design_review_state: designReviewStates.awaiting };
		const approvedParent = { global_priority: 1, title: 'Reports', design_review_state: designReviewStates.approved };
		const rows = [
			{ ...buildableRow('held-chunk', null), parent: heldParent },
			{ ...buildableRow('approved-chunk', null), parent: approvedParent }
		];
		const candidates = await readBuildCandidates(databaseHolding(rows), ['project-1']);
		expect(candidates.map(({ task }) => task.id)).toEqual(['approved-chunk']);
	});
});
