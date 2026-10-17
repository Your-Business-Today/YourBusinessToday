import { describe, expect, it } from 'vitest';
import { buildQueueEntries } from './buildQueueEntries';
import { parseTaskRecord } from '$lib/server/projects/taskRecord';
import type { BuildCandidate } from './readBuildCandidates';
import type { BuildModel } from '$lib/data/buildModels';
import type { LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';

const models: BuildModel[] = [
	{ modelId: 'qwen-local', label: 'Qwen on the Mac mini', leastPoints: 1, mostPoints: 2 },
	{ modelId: 'claude-opus', label: 'Claude Opus', leastPoints: 3, mostPoints: 8 }
];

const task = parseTaskRecord({
	id: 'task-1',
	project_id: 'project-1',
	goal_id: 'goal-1',
	title: 'Rename the board heading',
	status: 'backlog',
	story_points: 2,
	is_buildable: true,
	is_autocomplete: null
});

function candidate(queuePlace: number): BuildCandidate {
	return { task, projectName: 'YourBusinessToday', goalSetting: true, isWaiting: false, queuePlace };
}

describe('buildQueueEntries', () => {
	it('names the model the points choose and follows the goal for autocomplete', () => {
		const [entry] = buildQueueEntries([candidate(4)], new Map(), models);
		expect(entry).toMatchObject({ modelId: 'qwen-local', isAutocomplete: true, queuePlace: 4, heldBy: null });
	});

	it('shows who holds the goal when the task itself is free', () => {
		const goalHold = { claim: { agent: 'Claude cloud session', step: 'considering', since: '' } };
		const marks = new Map([['goal-1', goalHold as unknown as LifecycleMark]]);
		const [entry] = buildQueueEntries([candidate(Number.POSITIVE_INFINITY)], marks, models);
		expect(entry).toMatchObject({ heldBy: 'Claude cloud session', queuePlace: null, latestStep: null });
	});
});
