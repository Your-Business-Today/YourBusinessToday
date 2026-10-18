import { setTaskAutocompleteAction } from '$lib/server/autocomplete/setTaskAutocompleteAction';
import type { Actions } from './$types';

export const autocompleteActions = {
	setAutocomplete: setTaskAutocompleteAction
} satisfies Actions;
