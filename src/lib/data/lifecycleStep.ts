export const lifecycleSteps = {
	considering: 'considering',
	considered: 'considered',
	building: 'building',
	built: 'built',
	reviewing: 'reviewing',
	pullRequestOpen: 'pull_request_open',
	merged: 'merged',
	released: 'released'
} as const;

export type LifecycleStepName = (typeof lifecycleSteps)[keyof typeof lifecycleSteps];

export const lifecycleStepLabels: Record<LifecycleStepName, string> = {
	considering: 'Considering',
	considered: 'Considered',
	building: 'Building',
	built: 'Built',
	reviewing: 'Reviewing',
	pull_request_open: 'Pull request open',
	merged: 'Merged',
	released: 'Released'
};

export const lifecycleOutcomes = {
	none: '',
	buildable: 'buildable',
	waitingOnPerson: 'waiting_on_person',
	needsSplitting: 'needs_splitting',
	needsInfrastructure: 'needs_infrastructure'
} as const;

export type LifecycleOutcome = (typeof lifecycleOutcomes)[keyof typeof lifecycleOutcomes];

export const lifecycleOutcomeLabels: Record<LifecycleOutcome, string> = {
	'': '',
	buildable: 'buildable',
	waiting_on_person: 'waiting on a person',
	needs_splitting: 'needs splitting',
	needs_infrastructure: 'needs an infrastructure change'
};

/** The column limits of lifecycle_steps (migration 0114), stated once for the connector and any form. */
export const lifecycleStepLimits = {
	agent: 120,
	model: 120,
	runUrl: 500,
	branchName: 200,
	note: 2000
} as const;

export const githubAgent = 'GitHub';

export function isLifecycleStepName(value: string): value is LifecycleStepName {
	const names: readonly string[] = Object.values(lifecycleSteps);
	return names.includes(value);
}

export function isLifecycleOutcome(value: string): value is LifecycleOutcome {
	const outcomes: readonly string[] = Object.values(lifecycleOutcomes);
	return outcomes.includes(value);
}

export const stepChoices = Object.values(lifecycleSteps).join(', ');

export const outcomeChoices = Object.values(lifecycleOutcomes).filter(isNamedOutcome).join(', ');

function isNamedOutcome(outcome: LifecycleOutcome): boolean {
	return outcome !== lifecycleOutcomes.none;
}
