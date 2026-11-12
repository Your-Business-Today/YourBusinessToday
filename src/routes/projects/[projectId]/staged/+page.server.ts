import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { deliveryFactsOf } from '$lib/data/deliveryFacts';
import { deployWindowFactsOf } from '$lib/server/deployWindows/deployWindowFactsOf';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { findStagedTasks } from '$lib/server/projects/findStagedTasks';
import { getBranchRunsForProject } from '$lib/server/mainRuns/getMainRunsForProject';
import { readDevelopmentTabCounts } from '$lib/server/projects/readDevelopmentTabCounts';
import { readTogether } from '$lib/server/http/readTogether';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { stagedTasksOf } from '$lib/data/stagedTasks';
import { deployActions } from './deployActions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	const { supabase } = locals;
	const reads = await readTogether({
		stagedTasks: findStagedTasks(supabase, project.id),
		developmentTabCounts: readDevelopmentTabCounts(supabase, project.id),
		deploysSinceRefactor: countDeploysSinceRefactor(supabase, project),
		branchRuns: getBranchRunsForProject(supabase, project.id),
		deployWindowFacts: deployWindowFactsOf(supabase, project)
	});
	const { stagedTasks, deploysSinceRefactor, branchRuns, deployWindowFacts, developmentTabCounts } = reads;
	const cadenceLine = describeRefactorCadence({ refactorEveryDeploys: project.refactorEveryDeploys, deploysSinceRefactor });
	return {
		project,
		stagedTasks: stagedTasksOf(stagedTasks),
		developmentTabCounts,
		deliveryFacts: deliveryFactsOf({ project, cadenceLine, deployWindowFacts, ...branchRuns })
	};
};

export const actions = { ...deployActions } satisfies Actions;
