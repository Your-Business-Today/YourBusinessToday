import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { buildBoardOf, readBuildFacts, type BuildFacts } from '$lib/server/lifecycle/buildFacts';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTodosByTask } from '$lib/server/todos/getTodosByTask';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { loadDepartmentWork } from '$lib/server/departments/loadDepartmentWork';
import { readScrumBoard } from '$lib/server/scrumBoard/readScrumBoard';
import { readTogether } from '$lib/server/http/readTogether';
import { boardSides, type BoardSide } from '$lib/data/boardSide';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { ScrumBoard } from '$lib/data/scrumBoard';

/**
 * Everything the project page reads, started at once: only the tasks' assignees and turns wait,
 * for the tasks they belong to, and every other read runs beside them. Turns are read for every task
 * on the project, so how the project stands is read whole whichever tab is open. To-dos are read
 * only for Internal work, where each item shows its to-dos beneath it, and the scrum board only for Development.
 */
export function readBoard(locals: App.Locals, project: Project, url: URL) {
	const { supabase } = locals;
	const workRead = loadDepartmentWork(supabase, project, url);
	const buildFactsRead = readBuildFacts(supabase, project.id);
	const taskIdsRead = workRead.then(({ tasks }) => tasks.map((task) => task.id));
	const projectTaskIdsRead = workRead.then(({ projectTasks }) => projectTasks.map((task) => task.id));
	return readTogether({
		work: workRead,
		assigneeIdsByTask: taskIdsRead.then((taskIds) => getAssigneeIdsByTask(supabase, taskIds)),
		todosByTask: workRead.then((work) => todosShownOn(supabase, work)),
		turnsByTask: projectTaskIdsRead.then((taskIds) => getTaskTurns(supabase, taskIds)),
		latestKitVersion: getLatestKitVersion(supabase),
		organisations: getOrganisations(supabase),
		canTurnOnAutocomplete: isStaffMember(locals),
		people: getPeopleOnProject(supabase, project.id),
		buildBoard: buildFactsRead.then(buildBoardOf),
		scrumBoard: Promise.all([workRead, buildFactsRead]).then(([work, build]) => scrumBoardShownOn(supabase, project.id, work, build))
	});
}

type ShownWork = { boardSide: BoardSide; tasks: { id: string }[] };

function todosShownOn(supabase: SupabaseClient, work: ShownWork) {
	if (work.boardSide !== boardSides.internal) return Promise.resolve({});
	return getTodosByTask(supabase, work.tasks.map((task) => task.id));
}

type DevelopmentWork = { boardSide: BoardSide; projectTasks: ProjectTask[] };

async function scrumBoardShownOn(
	supabase: SupabaseClient,
	projectId: string,
	work: DevelopmentWork,
	build: BuildFacts
): Promise<ScrumBoard | null> {
	if (work.boardSide !== boardSides.development) return null;
	return readScrumBoard(supabase, projectId, work.projectTasks, build);
}
