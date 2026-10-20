import { describe, expect, it } from 'vitest';
import { readStartedDeployment, readStartedWorkflowRun } from './readStartedRunEvent';

const commitSha = 'c'.repeat(40);
const repository = { html_url: 'https://github.com/Your-Business-Today/YourBusinessToday' };

function workflowRun(action: string, headSha: string) {
	return {
		action,
		workflow_run: { id: 42, name: 'Merge pull request #170', head_branch: 'main', head_sha: headSha },
		workflow: { name: 'ci' },
		repository
	};
}

function deploymentStatus(environment: string, state: string) {
	return { deployment_status: { state }, deployment: { id: 7, environment, sha: commitSha }, repository };
}

describe('a check GitHub has started on a commit', () => {
	it('is a workflow run asked for on a branch, named for its workflow', () => {
		expect(readStartedWorkflowRun(workflowRun('requested', commitSha))).toEqual({
			repositoryUrl: repository.html_url,
			branch: 'main',
			isProductionDeploy: false,
			checkName: 'ci',
			commitSha
		});
	});

	it('is nothing for a finished run, or one with no commit GitHub named', () => {
		expect(readStartedWorkflowRun(workflowRun('completed', commitSha))).toBeNull();
		expect(readStartedWorkflowRun(workflowRun('requested', 'not-a-commit'))).toBeNull();
	});

	it('is a production deployment that is pending, and not a preview', () => {
		expect(readStartedDeployment(deploymentStatus('Production', 'pending'))).toMatchObject({
			checkName: 'Production deploy',
			isProductionDeploy: true,
			commitSha
		});
		expect(readStartedDeployment(deploymentStatus('Preview', 'pending'))).toBeNull();
		expect(readStartedDeployment(deploymentStatus('Production', 'success'))).toBeNull();
	});
});
