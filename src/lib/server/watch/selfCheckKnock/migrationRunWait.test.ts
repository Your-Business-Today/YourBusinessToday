import { describe, expect, it } from 'vitest';
import { waitForMigrations } from './migrationRunWait';
import { migrationRunReading, waitingWithoutWaiting } from './waitingForTests';

const deployedCommit = '3edf867aa';
const runUrl = 'https://github.com/Your-Business-Today/YourBusinessToday/actions/runs/141';
const stillRunning = { status: 'in_progress', conclusion: null, url: runUrl };
const succeeded = { status: 'completed', conclusion: 'success', url: runUrl };
const failedRun = { status: 'completed', conclusion: 'failure', url: runUrl };

describe("waiting for the deploy's migrations", () => {
	it('goes on once a run still going has finished', async () => {
		const waiting = waitingWithoutWaiting();
		const verdict = await waitForMigrations(deployedCommit, migrationRunReading(stillRunning, stillRunning, succeeded), waiting);
		expect(verdict).toBeNull();
		expect(waiting.lines).toContain(`The run migrations run for ${deployedCommit} has finished: ${runUrl}`);
	});

	it('goes straight on for a commit whose push started no run, as a redeploy of an older commit', async () => {
		expect(await waitForMigrations(deployedCommit, migrationRunReading(null), waitingWithoutWaiting())).toBeNull();
	});

	it('fails, naming the run, when the migrations failed', async () => {
		const verdict = await waitForMigrations(deployedCommit, migrationRunReading(failedRun), waitingWithoutWaiting());
		expect(verdict?.hasPassed).toBe(false);
		expect(verdict?.report).toContain(`ended failure`);
		expect(verdict?.report).toContain(runUrl);
	});

	it('gives up, red, saying the migrations had not finished, when the run never ends', async () => {
		const verdict = await waitForMigrations(deployedCommit, migrationRunReading(stillRunning), waitingWithoutWaiting());
		expect(verdict?.hasPassed).toBe(false);
		expect(verdict?.report).toContain('had not finished');
	});
});
