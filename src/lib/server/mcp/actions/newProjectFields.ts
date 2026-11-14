import { validateTextColumn } from '$lib/server/oauth/textColumnRules';

const newProjectTextFields = ['name', 'description', 'organisationId', 'repositoryUrl'];

/** Why create_project cannot store what it was given, or null when every field it names fits its text column. */
export function validateNewProjectFields(input: Record<string, unknown>): string | null {
	const givenFields = newProjectTextFields.filter((field) => input[field] !== undefined);
	const refusals = givenFields.map((field) => validateTextColumn(field, input[field]));
	return refusals.find((refusal) => refusal !== null) ?? null;
}
