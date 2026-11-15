import { noDeployWindow } from '$lib/data/deployTime';
import { stagingBranch } from '$lib/data/stagingBranch';
import type { Project } from '$lib/server/projects/projectRecord';

type Repository = Pick<Project, 'repositoryUrl' | 'defaultBranch' | 'deployStagingAt'>;

export const noRepositoryRecorded = 'No repository recorded';

const fetchedStaging = `origin/${stagingBranch}`;
const fetchStaging = `git fetch origin +refs/heads/${stagingBranch}:refs/remotes/${fetchedStaging}`;
const urgentFixSentence = 'The one exception is a fix the person asks for by name as urgent.';

/** The code line a builder reads to know which repository to check out for a task, and which branch its pull request goes into. */
export function repositoryLine(project: Repository): string {
	const sentences = [`${whereTheCodeIs(project)}.`, ...pullRequestBaseSentences(project)];
	return sentences.join(' ');
}

function whereTheCodeIs(project: Repository): string {
	if (project.repositoryUrl === '') return noRepositoryRecorded;
	return `Code: ${project.repositoryUrl} (deploys from ${project.defaultBranch})`;
}

function pullRequestBaseSentences(project: Repository): string[] {
	if (!isPromotedFromStaging(project)) return [];
	return [promotionSentence(project), urgentFixSentence, fetchSentence(project.defaultBranch)];
}

function isPromotedFromStaging(project: Repository): boolean {
	const hasRepository = project.repositoryUrl !== '';
	const hasDeployWindow = project.deployStagingAt !== noDeployWindow;
	return hasRepository && hasDeployWindow && project.defaultBranch !== stagingBranch;
}

function promotionSentence(project: Repository): string {
	const { defaultBranch, deployStagingAt } = project;
	const whereTheyGo = `Pull requests go into ${stagingBranch}, never into ${defaultBranch}`;
	return `${whereTheyGo}: ${defaultBranch} moves only when ${stagingBranch} is promoted, at ${deployStagingAt} UK time.`;
}

function fetchSentence(defaultBranch: string): string {
	const whyItHides = `A cloud session’s clone may hold ${defaultBranch} alone, so git branch -r proves nothing`;
	return `${whyItHides}: fetch ${stagingBranch} by name (${fetchStaging}) and branch from ${fetchedStaging}.`;
}
