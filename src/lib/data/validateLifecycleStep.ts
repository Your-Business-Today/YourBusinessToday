import {
	isLifecycleOutcome,
	isLifecycleStepName,
	lifecycleOutcomes,
	lifecycleStepLimits,
	lifecycleSteps,
	outcomeChoices,
	stepChoices,
	type LifecycleOutcome,
	type LifecycleStepName
} from './lifecycleStep';

export type LifecycleStepInput = {
	step: LifecycleStepName;
	outcome: LifecycleOutcome;
	agent: string;
	model: string;
	runUrl: string;
	branchName: string;
	note: string;
};

export type LifecycleStepFields = Record<keyof LifecycleStepInput, string>;

/** The step as given, or the reason it is refused: every field checked against its column, never trimmed to fit. */
export function validateLifecycleStep(fields: LifecycleStepFields): LifecycleStepInput | string {
	if (!isLifecycleStepName(fields.step)) return `step is one of ${stepChoices}.`;
	if (!isLifecycleOutcome(fields.outcome)) return `outcome is one of ${outcomeChoices}, or left out.`;
	const isConsidered = fields.step === lifecycleSteps.considered;
	const hasOutcome = fields.outcome !== lifecycleOutcomes.none;
	if (isConsidered !== hasOutcome) return 'An outcome is given with the considered step, and only with it.';
	if (fields.agent === '') return 'agent names the AI taking the step, such as "Claude cloud session".';
	const tooLong = overlongField(fields);
	if (tooLong !== null) return tooLong;
	return { ...fields, step: fields.step, outcome: fields.outcome };
}

function overlongField(fields: LifecycleStepFields): string | null {
	const limited = Object.entries(lifecycleStepLimits) as [keyof typeof lifecycleStepLimits, number][];
	const overlong = limited.find(([field, limit]) => fields[field].length > limit);
	if (overlong === undefined) return null;
	const [field, limit] = overlong;
	return `${field} is at most ${limit} characters.`;
}
