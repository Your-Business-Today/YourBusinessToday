import { goalHorizonLabels, goalHorizonOrder, goalsOnHorizon, type GoalHorizon } from '$lib/data/goalHorizon';
import { goalStatusLabels } from '$lib/data/goalStatus';
import { taskKindLabels, taskStatusLabelFor } from '$lib/data/taskKind';
import { latestStepSuffix, lifecycleLines } from './describeLifecycle';
import { threadLines } from './describeMessages';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { ConversationMessage } from '$lib/server/conversations/messageRecord';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { LifecycleStep } from '$lib/server/lifecycle/lifecycleStepRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const noSuchGoal = 'No goal you can reach has that id. Call find_goals on the project first.';

export function goalLine(goal: Goal): string {
	const measure = goal.measure === '' ? 'no measure written yet' : `measured by: ${goal.measure}`;
	const horizon = goalHorizonLabels[goal.horizon].toLowerCase();
	const place = `priority ${goal.priority} among the ${horizon} goals, id: ${goal.id}`;
	return `${goal.title} — ${goalStatusLabels[goal.status]}, ${horizon} goal, ${measure} (${place})`;
}

/** "Current goals, in priority order:" and the lines under it, then the long term ones. */
export function goalSectionLines(goals: Goal[]): string[] {
	return goalHorizonOrder.flatMap((horizon) => [
		`${goalHorizonLabels[horizon]} goals, in priority order:`,
		...goalLinesOn(goals, horizon),
		''
	]);
}

function goalLinesOn(goals: Goal[], horizon: GoalHorizon): string[] {
	const goalsOnIt = goalsOnHorizon(goals, horizon);
	if (goalsOnIt.length === 0) return ['None yet.'];
	return goalsOnIt.map(goalLine);
}

export type GoalReading = {
	goal: Goal;
	tasks: ProjectTask[];
	lifecycle: GoalLifecycle;
	messages: ConversationMessage[];
	accounts: Account[];
};

export type GoalLifecycle = { steps: LifecycleStep[]; latestByTask: Map<string, LifecycleStep> };

export function describeGoal(reading: GoalReading): string {
	const { goal, tasks, lifecycle, messages, accounts } = reading;
	return [
		goalLine(goal),
		...lifecycleLines(lifecycle.steps),
		'',
		...taskLines(tasks, lifecycle.latestByTask),
		'',
		...threadLines(messages, accounts)
	].join('\n');
}

function taskLines(tasks: ProjectTask[], latestByTask: Map<string, LifecycleStep>): string[] {
	if (tasks.length === 0) return ['Tasks under this goal: none yet.'];
	return ['Tasks under this goal:', ...tasks.map((task) => taskLine(task, latestByTask.get(task.id)))];
}

export function taskLine(task: ProjectTask, latestStep?: LifecycleStep): string {
	const kind = taskKindLabels[task.kind];
	const status = taskStatusLabelFor(task.kind, task.status);
	const place = `priority ${task.priority}, id: ${task.id}`;
	return `- ${task.title} — ${kind} task, ${status}${latestStepSuffix(latestStep)} (${place})`;
}
