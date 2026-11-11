import { describe, expect, it } from 'vitest';
import { scrumColumnsOf, workKinds, type ScrumCard, type WorkKind } from './scrumBoard';
import { buildStageOrder, buildStages, type BuildStage } from './buildStage';

function cardOf(id: string, stage: BuildStage, workKind: WorkKind, storyPoints: number): ScrumCard {
	return { id, projectId: 'p', title: id, stage, workKind, storyPoints, modelLabel: null, lifecycle: null, pullRequestUrl: '' };
}

describe('the scrum board columns', () => {
	const columns = scrumColumnsOf([
		cardOf('feature', buildStages.ready, workKinds.feature, 5),
		cardOf('bug', buildStages.ready, workKinds.bug, 3),
		cardOf('secrets', buildStages.backlog, workKinds.infrastructure, 1)
	]);

	it('shows every stage in build order, even an empty one', () => {
		expect(columns.map((column) => column.stage)).toEqual(buildStageOrder);
	});

	it('puts bugs above features and counts each column’s cards and points', () => {
		const ready = columns.find((column) => column.stage === buildStages.ready);
		expect(ready?.cards.map((card) => card.id)).toEqual(['bug', 'feature']);
		expect(ready?.cardCount).toBe(2);
		expect(ready?.totalPoints).toBe(8);
	});
});
