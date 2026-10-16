import { assignProjectToClient } from '$lib/server/projects/assignProjectToClient';
import { createProject } from '$lib/server/projects/createProject';
import { onboardingProjectDescription, onboardingProjectName } from '$lib/onboarding/onboarding';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OnboardingPlace = { organisationId: string; clientId: string; accountId: string };

/**
 * The Onboarding project under the organisation, made once: a team project, so every YBT staff
 * member is on it, and the client's, so it shows on their portal.
 */
export async function onboardingProjectFor(
	service: SupabaseClient,
	place: OnboardingPlace
): Promise<void> {
	const existingProjectId = await findOnboardingProject(service, place.organisationId);
	if (existingProjectId !== null) return;
	await createProject(service, {
		name: onboardingProjectName,
		description: onboardingProjectDescription,
		organisationId: place.organisationId,
		isTeamProject: true,
		ownerId: place.accountId,
		createdBy: place.accountId
	});
	const projectId = await findOnboardingProject(service, place.organisationId);
	if (projectId === null) return;
	const ownership = { clientId: place.clientId, repositoryUrl: '', environmentUrl: '' };
	await assignProjectToClient(service, projectId, ownership, place.accountId);
}

async function findOnboardingProject(
	service: SupabaseClient,
	organisationId: string
): Promise<string | null> {
	const { data, error } = await service
		.from('projects')
		.select('id')
		.eq('organisation_id', organisationId)
		.eq('name', onboardingProjectName)
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	return (data?.id as string) ?? null;
}
