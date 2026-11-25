import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getTaskIdsAssignedTo } from '$lib/server/projects/getTaskIdsAssignedTo';
import { countStagedTasks } from '$lib/server/projects/countStagedTasks';
import { buildBoardOf, readBuildFacts, type BuildFacts } from '$lib/server/lifecycle/buildFacts';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getPickableOrganisations } from '$lib/server/organisations/leadOrganisations';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTodosByTask } from '$lib/server/todos/getTodosByTask';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { loadDepartmentWork } from '$lib/server/departments/loadDepartmentWork';
import { readTogether } from '$lib/server/http/readTogether';
import { boardSides, type BoardSide } from '$lib/data/boardSide';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from '$lib/server/projects/projectRecord';

/**
 * Everything the project page reads, started at once: only the tasks' assignees and turns wait,
 * for the tasks they belong to, and every other read runs beside them. To-dos are read only for
 * Task Management, where each item shows its to-dos beneath it.
 */
export function readBoard(locals: App.Locals, project: Project, url: URL, viewerId: string) {
	const { supabase } = locals;
	const workRead = loadDepartmentWork(supabase, project, url);
	const buildFactsRead = readBuildFacts(supabase, project.id);
	const taskIdsRead = workRead.then(({ tasks }) => tasks.map((task) => task.id));
	return readTogether({
		work: workRead,
		assigneeIdsByTask: taskIdsRead.then((taskIds) => getAssigneeIdsByTask(supabase, taskIds)),
		viewerAssignedTaskIds: getTaskIdsAssignedTo(supabase, project.id, viewerId),
		todosByTask: workRead.then((work) => todosShownOn(supabase, work)),
		turnsByTask: taskIdsRead.then((taskIds) => getTaskTurns(supabase, taskIds)),
		latestKitVersion: getLatestKitVersion(supabase),
		organisations: getPickableOrganisations(supabase, project.organisationId),
		canTurnOnAutocomplete: isStaffMember(locals),
		people: getPeopleOnProject(supabase, project.id),
		buildBoard: buildFactsRead.then(buildBoardOf),
		stagedTaskCount: countStagedTasks(supabase, project.id)
	});
}

type ShownWork = { boardSide: BoardSide; tasks: { id: string }[] };

function todosShownOn(supabase: SupabaseClient, work: ShownWork) {
	if (work.boardSide !== boardSides.internal) return Promise.resolve({});
	return getTodosByTask(supabase, work.tasks.map((task) => task.id));
}
