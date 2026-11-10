import { getContext, setContext } from 'svelte';
import { noBoardActionChoices, type BoardActionChoices } from '$lib/data/boardActionForm';

const choicesKey = Symbol('board action choices');

/** The meeting page hands the action form who and where an action can go to, once, for every item. */
export function provideBoardActionChoices(choices: () => BoardActionChoices): void {
	setContext(choicesKey, choices);
}

export function boardActionChoices(): BoardActionChoices {
	const choices = getContext<(() => BoardActionChoices) | undefined>(choicesKey);
	return choices === undefined ? noBoardActionChoices : choices();
}
