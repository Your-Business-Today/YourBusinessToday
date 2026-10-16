import { getPortalProjects } from '$lib/server/portal/getPortalProjects';
import { onboardingProjectName } from '$lib/onboarding/onboarding';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A client is onboarding while one of its projects is its Onboarding project. */
export async function isOnboarding(supabase: SupabaseClient, clientId: string): Promise<boolean> {
	const projects = await getPortalProjects(supabase, clientId);
	return projects.some((project) => project.name === onboardingProjectName);
}
