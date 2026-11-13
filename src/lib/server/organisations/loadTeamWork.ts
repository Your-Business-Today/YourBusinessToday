import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getOpenTeamWork } from './getOpenTeamWork';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getReachableProjectsOf } from './getReachableProjectsOf';
import { teamWorkGroups, type TeamWorkGroup } from '$lib/data/organisationTeamWork';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The team's open jobs across an organisation's products, with who has each, and the people each product's jobs can go to. */
export type TeamWork = { groups: TeamWorkGroup[]; peopleByProduct: Record<string, ProjectPerson[]> };

/** The open administration, sales and marketing jobs on every product of the organisation the viewer can open. */
export async function loadTeamWork(supabase: SupabaseClient, viewerId: string, organisationId: string): Promise<TeamWork> {
	const products = await getReachableProjectsOf(supabase, viewerId, organisationId);
	const tasks = await getOpenTeamWork(supabase, products.map((product) => product.id));
	const productIdsWithJobs = [...new Set(tasks.map((task) => task.projectId))];
	const [assigneeIdsByTask, peopleLists] = await Promise.all([
		getAssigneeIdsByTask(supabase, tasks.map((task) => task.id)),
		Promise.all(productIdsWithJobs.map((productId) => getPeopleOnProject(supabase, productId)))
	]);
	const peopleByProduct = Object.fromEntries(productIdsWithJobs.map((productId, index) => [productId, peopleLists[index]]));
	return { groups: teamWorkGroups(tasks, products, assigneeIdsByTask), peopleByProduct };
}
