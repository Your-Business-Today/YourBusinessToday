import { stagingBranch } from '$lib/data/stagingBranch';
import { isStartedByHand, type DeployStart } from '$lib/data/deployStart';
import type { PullRequestDraft } from '$lib/server/github/pullRequests';
import type { Project } from '$lib/server/projects/projectRecord';
import type { UkClock } from '$lib/data/ukClock';

/** The one pull request of the day: staging into the default branch, titled as the kit's promote-staging script titles it. */
export function promotionTitle(project: Project, clock: UkClock): string {
	return `DEPLOY: ${stagingBranch} to ${project.defaultBranch}, ${clock.date}`;
}

export function promotionDraft(project: Project, clock: UkClock, commitCount: number, start: DeployStart): PullRequestDraft {
	return {
		base: project.defaultBranch,
		head: stagingBranch,
		title: promotionTitle(project, clock),
		body: promotionBody(project, commitCount, start)
	};
}

function promotionBody(project: Project, commitCount: number, start: DeployStart): string {
	const commits = commitCount === 1 ? '1 commit' : `${commitCount} commits`;
	return [
		`Promotes ${commits} from \`${stagingBranch}\` to \`${project.defaultBranch}\`, opened by Your Business Today ${startedByPhrase(project, start)}.`,
		'',
		'It merges itself once its checks pass, and that merge is the deploy.'
	].join('\n');
}

function startedByPhrase(project: Project, start: DeployStart): string {
	if (isStartedByHand(start)) return `when ${start.personName} pressed Deploy now`;
	return `at the project's deploy window (${project.deployStagingAt} UK time)`;
}
