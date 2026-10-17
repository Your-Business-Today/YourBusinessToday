import { lifecycleStepLimits, outcomeChoices, stepChoices } from '$lib/data/lifecycleStep';
import { readText, textField } from '../actionTypes';
import type { LifecycleStepFields } from '$lib/data/validateLifecycleStep';

export const subjectFields = {
	goalId: textField('The goal the step is on — give this or taskId'),
	taskId: textField('The task the step is on — give this or goalId')
};

export const lifecycleStepFields = {
	...subjectFields,
	step: textField(`One of ${stepChoices}`),
	outcome: textField(`With considered only: one of ${outcomeChoices}`),
	agent: textField(
		`Which AI is taking the step, such as "Claude cloud session" or "YBT desktop app on the Mac mini" — at most ${lifecycleStepLimits.agent} characters`
	),
	model: textField(`The model it runs on, such as claude-opus-5-5 — at most ${lifecycleStepLimits.model} characters`),
	runUrl: textField('A link to the session or machine run, if there is one'),
	branchName: textField('The branch, with built, reviewing and pull_request_open'),
	note: textField(`What was found or done, in a sentence or two — at most ${lifecycleStepLimits.note} characters`)
};

export function readLifecycleStepFields(input: Record<string, unknown>): LifecycleStepFields {
	return {
		step: readText(input, 'step'),
		outcome: readText(input, 'outcome'),
		agent: readText(input, 'agent'),
		model: readText(input, 'model'),
		runUrl: readText(input, 'runUrl'),
		branchName: readText(input, 'branchName'),
		note: readText(input, 'note')
	};
}
