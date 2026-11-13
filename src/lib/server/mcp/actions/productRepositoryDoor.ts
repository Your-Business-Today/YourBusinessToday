import { isRefused } from '$lib/server/companyContext/contextText';
import { noSuchProject } from './describeProject';
import { readText } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import { validateRepositoryCommit, validateRepositoryPath, type RepositoryPath } from '$lib/server/productRepository/validateRepositoryPath';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

/** One call through a door onto a product's repository: whose it is, where in it, and at which commit or branch. */
export type RepositoryDoor = {
	project: Project;
	location: RepositoryPath;
	ref: string;
	readAt: string;
};

export const unreadableRepository =
	"The site's GitHub access cannot read this repository. Read it with your own GitHub if this chat has it, " +
	"or ask an administrator to give the site's GitHub access to it.";

/**
 * The repository recorded on a product the caller is on, opened at the path and commit asked for, or the reason it
 * cannot be: another's product, no repository recorded, or a path or commit that is refused.
 */
export async function openRepositoryDoor(caller: McpCaller, input: Record<string, unknown>, isPathRequired: boolean): Promise<RepositoryDoor | string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	if (project.repositoryUrl === '') return `No repository is recorded on ${project.name}: its owner records one with update_project_details.`;
	const location = validateRepositoryPath(input.path, isPathRequired);
	if (isRefused(location)) return location.refusal;
	const commit = validateRepositoryCommit(input.commit);
	if (isRefused(commit)) return commit.refusal;
	if (commit === null) return { project, location, ref: project.defaultBranch, readAt: `the head of ${project.defaultBranch}` };
	return { project, location, ref: commit, readAt: `commit ${commit}` };
}
