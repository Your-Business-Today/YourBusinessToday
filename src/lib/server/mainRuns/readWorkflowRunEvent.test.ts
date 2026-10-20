import { describe, expect, it } from 'vitest';
import { readWorkflowRunEvent } from './readWorkflowRunEvent';

const receivedAt = new Date('2026-10-13T12:00:00Z');
const commitSha = 'd'.repeat(40);
const repository = { html_url: 'https://github.com/Your-Business-Today/YourBusinessToday' };

function completedRun(conclusion: string | null) {
	return {
		action: 'completed',
		workflow_run: {
			id: 42,
			name: 'run migrations',
			head_branch: 'main',
			head_sha: commitSha,
			conclusion,
			html_url: 'https://github.com/Your-Business-Today/YourBusinessToday/actions/runs/42',
			updated_at: '2026-10-13T11:59:00Z'
		},
		repository
	};
}

describe('a workflow run GitHub says has finished', () => {
	it('is a failed run of its workflow on its branch, linking to the run', () => {
		expect(readWorkflowRunEvent(completedRun('failure'), receivedAt)).toEqual({
			repositoryUrl: repository.html_url,
			branch: 'main',
			isProductionDeploy: false,
			checkName: 'run migrations',
			runId: '42',
			commitSha,
			outcome: 'failed',
			runUrl: 'https://github.com/Your-Business-Today/YourBusinessToday/actions/runs/42',
			finishedAt: '2026-10-13T11:59:00Z'
		});
	});

	it('is named for its workflow, not for the run title its commit gave it', () => {
		const { workflow_run: run } = completedRun('success');
		const titledRun = { ...run, name: 'Deploy to the live portal: Merge pull request #436' };
		const event = { ...completedRun('success'), workflow_run: titledRun, workflow: { name: 'Deploy to the live portal' } };
		expect(readWorkflowRunEvent(event, receivedAt)?.checkName).toBe('Deploy to the live portal');
	});

	it('passes when it succeeded and fails when it timed out', () => {
		expect(readWorkflowRunEvent(completedRun('success'), receivedAt)?.outcome).toBe('passed');
		expect(readWorkflowRunEvent(completedRun('timed_out'), receivedAt)?.outcome).toBe('failed');
	});

	it('is nothing when it was cancelled or skipped, or has not finished', () => {
		expect(readWorkflowRunEvent(completedRun('cancelled'), receivedAt)).toBeNull();
		expect(readWorkflowRunEvent(completedRun('skipped'), receivedAt)).toBeNull();
		expect(readWorkflowRunEvent({ ...completedRun(null), action: 'in_progress' }, receivedAt)).toBeNull();
	});
});
