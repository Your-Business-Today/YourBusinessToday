import { describe, expect, it } from 'vitest';
import { deliveryFactsOf } from './deliveryFacts';

const failedOnStaging = { checkName: 'Run test suite', outcome: 'failed', runUrl: 'https://run/7', finishedAt: '' } as const;
const sources = {
	project: { repositoryUrl: 'https://github.com/harbour/site' },
	cadenceLine: '3 of 10 deploys since the last refactor round.',
	deployWindowFacts: [{ label: 'staging deploys today at 00:00' }],
	mainRuns: [],
	stagingRuns: [failedOnStaging]
};

describe('deliveryFactsOf', () => {
	it('gives the deploy window first, then the failing checks, then the refactor rhythm', () => {
		expect(deliveryFactsOf(sources)).toEqual([
			{ label: 'staging deploys today at 00:00' },
			{ label: '✗ Run test suite failed on staging', href: 'https://run/7' },
			{ label: '3 of 10 deploys since the last refactor round.' }
		]);
	});

	it('says nothing for a project with no repository', () => {
		expect(deliveryFactsOf({ ...sources, project: { repositoryUrl: '' } })).toEqual([]);
	});
});
