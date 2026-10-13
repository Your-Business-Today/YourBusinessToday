import { describe, expect, it } from 'vitest';
import { mainRunFacts, noMainRunsYet } from './mainRunFacts';

describe('the state of main on a project header', () => {
	it('shows each check passed or failed, linking to its run', () => {
		const facts = mainRunFacts([
			{ checkName: 'Production deploy', outcome: 'passed', runUrl: '', finishedAt: '2026-10-13T11:00:00Z' },
			{ checkName: 'run migrations', outcome: 'failed', runUrl: 'https://run/42', finishedAt: '2026-10-13T11:00:00Z' }
		]);
		expect(facts).toEqual([
			{ label: '✓ Production deploy passed' },
			{ label: '✗ run migrations failed', href: 'https://run/42' }
		]);
	});

	it('says no run has been read when there is none', () => {
		expect(mainRunFacts([])).toEqual([{ label: noMainRunsYet }]);
	});
});
