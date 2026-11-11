import { describe, expect, it } from 'vitest';
import { describeScrumBoard } from './describeScrumBoard';
import { scrumColumnsOf, workKinds } from '$lib/data/scrumBoard';
import { buildStages } from '$lib/data/buildStage';

describe('the scrum board read_project gives', () => {
	const columns = scrumColumnsOf([
		{
			id: 'task-1',
			projectId: 'p',
			title: 'FIX: the board is blank',
			stage: buildStages.building,
			workKind: workKinds.bug,
			storyPoints: 3,
			modelLabel: 'Claude Opus',
			lifecycle: { step: 'building', agent: 'Local model', isHeld: true },
			pullRequestUrl: ''
		}
	]);
	const velocity = {
		weeks: ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'].map((weekStart, index) => ({
			weekStart,
			points: index
		})),
		averagePoints: 2.5
	};
	const text = describeScrumBoard({ columns, velocity });

	it('lists every column with its count and points', () => {
		expect(text).toMatch(/^Backlog \(.*\) — 0 cards, 0 points\.$/m);
		expect(text).toMatch(/^Building \(.*\) — 1 card, 3 points:$/m);
		expect(text).toContain('- FIX: the board is blank — bug, 3 points, needs Claude Opus, Building, Local model (id: task-1)');
	});

	it('gives the points that went live each week and their average', () => {
		expect(text).toContain('week of 5 Oct: 0; week of 12 Oct: 1;');
		expect(text).toContain('week of 9 Nov: 5.');
		expect(text).toContain('Average: 2.5 points a week.');
	});
});
