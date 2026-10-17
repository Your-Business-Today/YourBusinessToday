import { isLifecycleOutcome, isLifecycleStepName, lifecycleOutcomes, lifecycleSteps } from '$lib/data/lifecycleStep';
import type { LifecycleOutcome, LifecycleStepName } from '$lib/data/lifecycleStep';

export type LifecycleStep = {
	id: string;
	projectId: string;
	goalId: string | null;
	taskId: string | null;
	step: LifecycleStepName;
	outcome: LifecycleOutcome;
	agent: string;
	model: string;
	runUrl: string;
	branchName: string;
	note: string;
	recordedBy: string | null;
	createdAt: string;
};

export function parseLifecycleStep(row: Record<string, unknown>): LifecycleStep {
	const step = String(row.step ?? '');
	const outcome = String(row.outcome ?? '');
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		goalId: (row.goal_id as string) ?? null,
		taskId: (row.task_id as string) ?? null,
		step: isLifecycleStepName(step) ? step : lifecycleSteps.considering,
		outcome: isLifecycleOutcome(outcome) ? outcome : lifecycleOutcomes.none,
		agent: row.agent as string,
		model: (row.model as string) ?? '',
		runUrl: (row.run_url as string) ?? '',
		branchName: (row.branch_name as string) ?? '',
		note: (row.note as string) ?? '',
		recordedBy: (row.recorded_by as string) ?? null,
		createdAt: row.created_at as string
	};
}

/** The subject a step is about: its task, or its goal when it is a goal's step. */
export function stepSubjectId(step: LifecycleStep): string {
	return step.taskId ?? (step.goalId as string);
}
