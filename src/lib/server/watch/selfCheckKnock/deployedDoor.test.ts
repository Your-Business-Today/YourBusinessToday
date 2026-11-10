import { describe, expect, it } from 'vitest';
import { knockUntilDeployed } from './deployedDoor';
import { doorAnswering, waitingWithoutWaiting } from './waitingForTests';

const deployedCommit = '3edf867aa';
const commitBefore = '11c5f3baa';
const passedBody = '{"note":"The connector keeps the pipeline contract and answered all 15 of its reads."}';
const fromTheDeploy = { status: 200, commit: deployedCommit, body: passedBody };
const fromTheDeployBefore = { status: 200, commit: commitBefore, body: passedBody };
const fromCodeWithoutTheWatcher = { status: 404, commit: null, body: '{"message":"unknown_source"}' };

describe('knocking until the deploy answers', () => {
	it('passes when the deployment of the commit answers 200', async () => {
		const verdict = await knockUntilDeployed(deployedCommit, doorAnswering(fromTheDeploy), waitingWithoutWaiting());
		expect(verdict.hasPassed).toBe(true);
		expect(verdict.report).toContain(deployedCommit);
	});

	it('never counts an answer from another commit, and knocks again until the deploy answers', async () => {
		const door = doorAnswering(fromCodeWithoutTheWatcher, fromTheDeployBefore, fromTheDeploy);
		const waiting = waitingWithoutWaiting();
		const verdict = await knockUntilDeployed(deployedCommit, door, waiting);
		expect(verdict.hasPassed).toBe(true);
		expect(door.knocks()).toBe(3);
		expect(waiting.lines).toContain(`A deployment that names no commit answered 404, not ${deployedCommit} yet: knocking again shortly.`);
	});

	it('gives up, red, naming the commit the site was still serving, when the door never changes', async () => {
		const verdict = await knockUntilDeployed(deployedCommit, doorAnswering(fromTheDeployBefore), waitingWithoutWaiting());
		expect(verdict.hasPassed).toBe(false);
		expect(verdict.report).toContain(`still served by the deployment of ${commitBefore}, not ${deployedCommit}`);
	});

	it('fails with the answer when the deployment of the commit finds the connector wanting', async () => {
		const failing = { status: 500, commit: deployedCommit, body: '{"note":"find_tasks no longer offered"}' };
		const waiting = waitingWithoutWaiting();
		const verdict = await knockUntilDeployed(deployedCommit, doorAnswering(failing), waiting);
		expect(verdict.hasPassed).toBe(false);
		expect(verdict.report).toContain('answered 500');
		expect(waiting.lines).toContain(failing.body);
	});
});
