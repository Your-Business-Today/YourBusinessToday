import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { deployWindowFactsOf } from '$lib/server/deployWindows/deployWindowFactsOf';
import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getBranchRunsForProject } from '$lib/server/mainRuns/getMainRunsForProject';
import { getBuildBoard } from '$lib/server/lifecycle/getBuildBoard';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { loadDepartmentWork } from '$lib/server/departments/loadDepartmentWork';
import { readTogether } from '$lib/server/http/readTogether';
import type { Project } from '$lib/server/projects/projectRecord';

/**
 * Everything the project page reads, started at once: only the tasks' assignees and turns wait,
 * for the tasks they belong to, and every other read runs beside them.
 */
export function readBoard(locals: App.Locals, project: Project, url: URL) {
	const { supabase } = locals;
	const workRead = loadDepartmentWork(supabase, project.id, url);
	const taskIdsRead = workRead.then(({ tasks }) => tasks.map((task) => task.id));
	return readTogether({
		work: workRead,
		assigneeIdsByTask: taskIdsRead.then((taskIds) => getAssigneeIdsByTask(supabase, taskIds)),
		turnsByTask: taskIdsRead.then((taskIds) => getTaskTurns(supabase, taskIds)),
		deploysSinceRefactor: countDeploysSinceRefactor(supabase, project),
		latestKitVersion: getLatestKitVersion(supabase),
		branchRuns: getBranchRunsForProject(supabase, project.id),
		organisations: getOrganisations(supabase),
		canTurnOnAutocomplete: isStaffMember(locals),
		deployWindowFacts: deployWindowFactsOf(supabase, project),
		people: getPeopleOnProject(supabase, project.id),
		buildBoard: getBuildBoard(supabase, project.id)
	});
}
