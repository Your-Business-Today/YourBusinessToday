import type { TraitValue } from '../values/traitValue';

export const decisionStatuses = ['proposed', 'adopted', 'retired'] as const;

export type DecisionStatus = (typeof decisionStatuses)[number];

export const DecisionStatuses = {
	proposed: 'proposed',
	adopted: 'adopted',
	retired: 'retired'
} as const satisfies Record<string, DecisionStatus>;

/** The statuses a decision can be recorded with: a retired one is only ever reached from one of these. */
export type RecordedStatus = typeof DecisionStatuses.proposed | typeof DecisionStatuses.adopted;

export const decisionSources = ['onboarding', 'staff', 'client', 'mcp', 'learned'] as const;

export type DecisionSource = (typeof decisionSources)[number];

/** Where a decision came from when a person's Claude recorded it through the connector. */
export const connectorSource: DecisionSource = 'mcp';

export type Decision = {
	id: string;
	traitKey: string;
	mediumPath: string;
	value: TraitValue;
	rationale: string;
	source: DecisionSource;
	status: DecisionStatus;
	decidedAt: string;
};

export type DecisionDraft = { traitKey: string; mediumPath: string; value: unknown };

export type CheckedDecision = { traitKey: string; mediumPath: string; value: TraitValue };

