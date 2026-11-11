import { describe, expect, it } from 'vitest';
import { knockConnectorSelfCheck } from './knockConnectorSelfCheck';
import { doorAnswering, migrationRunReading, waitingWithoutWaiting } from './waitingForTests';

const commit = '3edf867aa';
const runUrl = 'https://github.com/Your-Business-Today/YourBusinessToday/actions/runs/141';
const fromTheDeploy = { status: 200, commit, body: '{"isFinished":true}' };

describe('the connector self-check knock for one deploy', () => {
	it('passes once the migrations have finished and the deploy answers', async () => {
		const door = doorAnswering(fromTheDeploy);
		const migrations = migrationRunReading({ status: 'queued', conclusion: null, url: runUrl }, { status: 'completed', conclusion: 'success', url: runUrl });
		const verdict = await knockConnectorSelfCheck({ commit, knockDoor: door, readMigrationRun: migrations, waiting: waitingWithoutWaiting() });
		expect(verdict.hasPassed).toBe(true);
		expect(door.knocks()).toBe(1);
	});

	it('never knocks when the migrations failed', async () => {
		const door = doorAnswering(fromTheDeploy);
		const migrations = migrationRunReading({ status: 'completed', conclusion: 'failure', url: runUrl });
		const verdict = await knockConnectorSelfCheck({ commit, knockDoor: door, readMigrationRun: migrations, waiting: waitingWithoutWaiting() });
		expect(verdict.hasPassed).toBe(false);
		expect(door.knocks()).toBe(0);
	});
});
