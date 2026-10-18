import type { Project } from '$lib/server/projects/projectRecord';

type Repository = Pick<Project, 'repositoryUrl' | 'defaultBranch'>;

export const noRepositoryRecorded = 'No repository recorded';

/** The clause the project and task descriptions build their code line from: where the code is and which branch deploys. */
export function repositoryPhrase(project: Repository): string {
	if (project.repositoryUrl === '') return noRepositoryRecorded;
	return `Code: ${project.repositoryUrl} (deploys from ${project.defaultBranch})`;
}

/** The code line a builder reads to know which repository to check out for a task. */
export function repositoryLine(project: Repository): string {
	return `${repositoryPhrase(project)}.`;
}
