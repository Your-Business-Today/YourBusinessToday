import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getProjectBlueprint } from './getProjectBlueprint';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { blueprintReadingKinds, readProjectBlueprint } from './readProjectBlueprint';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

/**
 * What the domain and the site map pages show: the project's last blueprint, read from its repository the first
 * time anyone opens either page so there is something to browse without a deploy, and its goals for raising a change.
 */
export async function loadBlueprintPage(locals: App.Locals, projectId: string) {
	const { project } = await requireProjectAccess(locals, projectId);
	const stored = await getProjectBlueprint(locals.supabase, project.id);
	const blueprint = stored ?? (await readFirstBlueprint(project));
	return { project, blueprint, goals: await getGoalsForProject(locals.supabase, project.id) };
}

async function readFirstBlueprint(project: Project): Promise<ProjectBlueprint | null> {
	if (project.repositoryUrl === '') return null;
	try {
		const reading = await readProjectBlueprint(supabaseServiceClient(), project);
		return reading.kind === blueprintReadingKinds.read ? reading.blueprint : null;
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return null;
		throw failure;
	}
}
