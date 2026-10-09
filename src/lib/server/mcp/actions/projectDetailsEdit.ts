import { parseRefactorEveryDeploys } from '$lib/server/projects/projectRecord';
import { projectStatusOrder } from '$lib/data/projectStatus';
import { readOptionalText } from '../actionTypes';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectDetailsUpdate } from '$lib/server/projects/updateProjectDetails';
import type { ProjectStatus } from '$lib/data/projectStatus';

export const wrongStatus = `A project is ${projectStatusOrder.join(', ')}. Pick one of those.`;

/** The project as the edit leaves it: every field given replaces, every field left out keeps what is there. */
export function parseProjectDetailsEdit(
	input: Record<string, unknown>,
	project: Project
): ProjectDetailsUpdate | null {
	const status = readStatus(input, project);
	if (status === null) return null;
	return {
		name: readOptionalText(input, 'name') ?? project.name,
		description: readOptionalText(input, 'description') ?? project.description,
		status,
		repositoryUrl: readOptionalText(input, 'repositoryUrl') ?? project.repositoryUrl,
		environmentUrl: readOptionalText(input, 'environmentUrl') ?? project.environmentUrl,
		defaultBranch: readOptionalText(input, 'defaultBranch') ?? project.defaultBranch,
		refactorEveryDeploys: readRefactorEveryDeploys(input, project)
	};
}

function readStatus(input: Record<string, unknown>, project: Project): ProjectStatus | null {
	const status = readOptionalText(input, 'status');
	if (status === null) return project.status;
	if (projectStatusOrder.includes(status as ProjectStatus)) return status as ProjectStatus;
	return null;
}

function readRefactorEveryDeploys(input: Record<string, unknown>, project: Project): number {
	if (input.refactorEveryDeploys === undefined || input.refactorEveryDeploys === null) {
		return project.refactorEveryDeploys;
	}
	return parseRefactorEveryDeploys(input.refactorEveryDeploys);
}
