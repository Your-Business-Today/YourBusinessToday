import { describe, expect, it } from 'vitest';
import { failedRunTitle, repositoryNameOf } from './failedRunTask';
import type { FinishedRun } from '$lib/data/mainRun';

const failedMigrations: FinishedRun = {
	repositoryUrl: 'https://github.com/Your-Business-Today/jewel-portal.git',
	branch: 'main',
	isProductionDeploy: false,
	checkName: 'jewel-portal-migrations',
	runId: '42',
	outcome: 'failed',
	runUrl: 'https://run/42',
	finishedAt: '2026-10-13T11:00:00Z'
};

describe('the FIX task a failed run on main raises', () => {
	it('names the check, the default branch and the repository', () => {
		expect(failedRunTitle(failedMigrations, 'main')).toBe(
			'FIX: jewel-portal-migrations failed on main in jewel-portal'
		);
	});

	it('reads the repository name however its address was written', () => {
		expect(repositoryNameOf('git@github.com:Your-Business-Today/YourBusinessToday.git')).toBe('YourBusinessToday');
	});
});
