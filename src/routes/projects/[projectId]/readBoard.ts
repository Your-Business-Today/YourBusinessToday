import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getNextActionsByTask } from '$lib/server/projects/getNextActionsByTask';
import { isTaskDone } from '$lib/data/taskStatus';
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
 * Everything the project page reads, started at once: only the tasks' assignees, turns and next
 * moves wait, for the tasks they belong to, and every other read runs beside them. The next moves
 * are read for every open task of the project, so a count on one tab knows what the others hold. To-dos are read only for
 * Task Management, where each item shows its to-dos beneath it.
 */
export function readBoard(locals: App.Locals, project: Project, url: URL) {
	const { supabase } = locals;
	const workRead = loadDepartmentWork(supabase, project, url);
	const buildFactsRead = readBuildFacts(supabase, project.id);
	const taskIdsRead = workRead.then(({ tasks }) => tasks.map((task) => task.id));
	return readTogether({
		work: workRead,
		assigneeIdsByTask: taskIdsRead.then((taskIds) => getAssigneeIdsByTask(supabase, taskIds)),
		nextActionsByTask: workRead.then(({ projectTasks }) => getNextActionsByTask(supabase, projectTasks.filter(isOpen))),
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

function isOpen(task: { status: Parameters<typeof isTaskDone>[0] }): boolean {
	return !isTaskDone(task.status);
}

type ShownWork = { boardSide: BoardSide; tasks: { id: string }[] };

function todosShownOn(supabase: SupabaseClient, work: ShownWork) {
	if (work.boardSide !== boardSides.internal) return Promise.resolve({});
	return getTodosByTask(supabase, work.tasks.map((task) => task.id));
}
