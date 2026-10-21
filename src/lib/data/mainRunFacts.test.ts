import { describe, expect, it } from 'vitest';
import { mainRunFacts } from './mainRunFacts';

describe('the state of main on a project header', () => {
	it('shows only the checks that failed, linking to their run', () => {
		const facts = mainRunFacts([
			{ checkName: 'Production deploy', outcome: 'passed', runUrl: '', finishedAt: '2026-10-13T11:00:00Z' },
			{ checkName: 'run migrations', outcome: 'failed', runUrl: 'https://run/42', finishedAt: '2026-10-13T11:00:00Z' }
		]);
		expect(facts).toEqual([{ label: '✗ run migrations failed', href: 'https://run/42' }]);
	});

	it('says nothing while every check passes or none has been read', () => {
		const passed = { checkName: 'Production deploy', outcome: 'passed', runUrl: '', finishedAt: '' } as const;
		expect(mainRunFacts([passed])).toEqual([]);
		expect(mainRunFacts([])).toEqual([]);
	});

	it('names the branch of a check failing on staging', () => {
		const failed = { checkName: 'run migrations', outcome: 'failed', runUrl: '', finishedAt: '' } as const;
		expect(mainRunFacts([failed], 'staging')).toEqual([{ label: '✗ run migrations failed on staging' }]);
	});
});
