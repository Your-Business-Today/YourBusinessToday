import type { SupabaseClient } from '@supabase/supabase-js';
import { getOrganisations } from './getOrganisations';
import { readOrganisationChoice } from './organisationChoiceForm';
import { setProjectOrganisation } from './setProjectOrganisation';
import type { Project } from '$lib/server/projects/projectRecord';

/** Moves the project to the organisation the edit form names, if it changed; answers why not when it cannot. */
export async function changeProjectOrganisation(
	supabase: SupabaseClient,
	project: Project,
	formData: FormData
): Promise<string | null> {
	const choice = readOrganisationChoice(formData, await getOrganisations(supabase));
	if ('refusal' in choice) return choice.refusal;
	if (choice.organisationId === project.organisationId) return null;
	await setProjectOrganisation(supabase, project.id, choice.organisationId, project.organisationId);
	return null;
}
