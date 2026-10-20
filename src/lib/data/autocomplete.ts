export type AutocompleteSetting = boolean | null;

export const autocompleteChoices = { on: 'on', off: 'off', followGoal: 'follow_goal' } as const;

export type AutocompleteChoice = (typeof autocompleteChoices)[keyof typeof autocompleteChoices];

const settingByChoice: Record<AutocompleteChoice, AutocompleteSetting> = {
	on: true,
	off: false,
	follow_goal: null
};

export const autocompleteChoiceLabels: Record<AutocompleteChoice, string> = {
	on: 'On',
	off: 'Off',
	follow_goal: 'Follow its goal'
};

/** A task the connector raises starts with autocomplete on, set on the task, while the build process is proven. */
export const connectorTaskAutocomplete: AutocompleteSetting = true;

export const autocompleteChoiceRefusal = 'Autocomplete is one of on, off or follow_goal.';

/** The setting a choice stands for, or undefined when the choice is not one of the three — never guessed. */
export function validateAutocompleteChoice(value: unknown): AutocompleteSetting | undefined {
	const choice = String(value ?? '') as AutocompleteChoice;
	if (!(choice in settingByChoice)) return undefined;
	return settingByChoice[choice];
}

export function choiceForSetting(setting: AutocompleteSetting): AutocompleteChoice {
	if (setting === null) return autocompleteChoices.followGoal;
	return setting ? autocompleteChoices.on : autocompleteChoices.off;
}

/** A task's own setting wins; without one it follows its goal, and with no goal it is on. */
export function isTaskAutocomplete(taskSetting: AutocompleteSetting, isGoalAutocomplete: boolean | null): boolean {
	return taskSetting ?? isGoalAutocomplete ?? true;
}

export function parseGoalAutocomplete(value: unknown): boolean {
	return value !== false;
}

export function parseTaskAutocomplete(value: unknown): AutocompleteSetting {
	if (typeof value !== 'boolean') return null;
	return value;
}

export function autocompleteWord(isAutocomplete: boolean): string {
	return isAutocomplete ? 'on' : 'off';
}

/** "Autocomplete on, following its goal." — what a task's setting comes to and where it comes from. */
export function autocompleteSentence(setting: AutocompleteSetting, isGoalAutocomplete: boolean | null): string {
	const isOn = isTaskAutocomplete(setting, isGoalAutocomplete);
	return `Autocomplete ${autocompleteWord(isOn)}, ${settingSource(setting, isGoalAutocomplete)}.`;
}

function settingSource(setting: AutocompleteSetting, isGoalAutocomplete: boolean | null): string {
	if (setting !== null) return 'set on the task';
	if (isGoalAutocomplete === null) return 'with no goal to follow';
	return 'following its goal';
}

/** The goal's autocomplete setting, or null when the task has no goal among those given. */
export function goalAutocomplete(
	goals: { id: string; isAutocomplete: boolean }[],
	goalId: string | null
): boolean | null {
	return goals.find((goal) => goal.id === goalId)?.isAutocomplete ?? null;
}

/** A goal's switch, which is true or false and nothing else — never read from a word. */
export function validateGoalAutocompleteSwitch(value: unknown): boolean | undefined {
	if (typeof value !== 'boolean') return undefined;
	return value;
}
