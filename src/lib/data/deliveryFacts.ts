import { mainRunFacts } from './mainRunFacts';
import { stagingBranch } from './stagingBranch';
import type { DeployWindowFact } from './deployWindowFacts';
import type { MainRun } from './mainRun';

export type DeliveryFact = { label: string; href?: string; detail?: string };

/** What a project's board has read about how its work reaches live. */
export type DeliverySources = {
	project: { repositoryUrl: string };
	cadenceLine: string;
	deployWindowFacts: DeployWindowFact[];
	mainRuns: MainRun[];
	stagingRuns: MainRun[];
};

const noRepository = '';

/**
 * How merged work reaches live: the deploy window and the last promotion, the checks failing on the default
 * branch and on staging, and how near the next refactor round is. Nothing for a project with no repository.
 */
export function deliveryFactsOf(sources: DeliverySources): DeliveryFact[] {
	const { project, cadenceLine, deployWindowFacts, mainRuns, stagingRuns } = sources;
	if (project.repositoryUrl === noRepository) return [];
	const failingChecks = [...mainRunFacts(mainRuns), ...mainRunFacts(stagingRuns, stagingBranch)];
	return [...deployWindowFacts, ...failingChecks, { label: cadenceLine }];
}
