import type { TraitValue } from '../values/traitValue';

export const decisionStatuses = ['proposed', 'adopted', 'retired'] as const;

export type DecisionStatus = (typeof decisionStatuses)[number];

export const decisionSources = ['onboarding', 'staff', 'client', 'mcp', 'learned'] as const;

export type DecisionSource = (typeof decisionSources)[number];

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

