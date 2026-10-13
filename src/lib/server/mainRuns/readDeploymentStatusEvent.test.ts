import { describe, expect, it } from 'vitest';
import { productionDeployCheck, readDeploymentStatusEvent } from './readDeploymentStatusEvent';

const receivedAt = new Date('2026-10-13T12:00:00Z');

function deploymentStatus(environment: string, state: string) {
	return {
		deployment_status: {
			state,
			log_url: 'https://vercel.com/ybt/deployments/abc',
			target_url: 'https://ybt-abc.vercel.app',
			updated_at: '2026-10-13T11:58:00Z'
		},
		deployment: { id: 7, environment },
		repository: { html_url: 'https://github.com/Your-Business-Today/YourBusinessToday' }
	};
}

describe('a deployment status GitHub passes on from Vercel', () => {
	it('is the production deploy failing, linking to its log', () => {
		const run = readDeploymentStatusEvent(deploymentStatus('Production', 'error'), receivedAt);
		expect(run).toMatchObject({
			checkName: productionDeployCheck,
			isProductionDeploy: true,
			runId: '7',
			outcome: 'failed',
			runUrl: 'https://vercel.com/ybt/deployments/abc'
		});
	});

	it('is the production deploy passing when it succeeded', () => {
		expect(readDeploymentStatusEvent(deploymentStatus('Production', 'success'), receivedAt)?.outcome).toBe('passed');
	});

	it('is nothing for a preview, or a deployment still building', () => {
		expect(readDeploymentStatusEvent(deploymentStatus('Preview', 'failure'), receivedAt)).toBeNull();
		expect(readDeploymentStatusEvent(deploymentStatus('Production', 'pending'), receivedAt)).toBeNull();
	});
});
