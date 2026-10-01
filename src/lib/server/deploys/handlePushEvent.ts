import type { SupabaseClient } from '@supabase/supabase-js';
import { findProjectsByRepository } from './findProjectsByRepository';
import { isSameRepository } from './repositoryUrlKey';
import { projectProcessDefaultBranch, projectProcessRepositoryUrl } from '$lib/server/kit/projectProcessKit';
import { raiseRefactorRoundIfDue, type RoundOutcome } from '$lib/server/refactor/raiseRefactorRoundIfDue';
import { readLatestKitVersion, readKitVersionOfProject, type KitVersionReading } from '$lib/server/kit/readKitVersions';
import { readPushEvent, type PushedDeploy } from './readPushEvent';
import { recordDeploy } from './recordDeploy';
import type { Project } from '$lib/server/projects/projectRecord';

export type PushOutcome =
	| { kind: 'ignored'; reason: 'not_a_branch_push' | 'no_project_for_repository' | 'not_the_default_branch' }
	| { kind: 'recorded'; projects: DeployOutcome[] };

type DeployOutcome = { projectId: string; isNew: boolean; round: RoundOutcome; kit: KitVersionReading };

/**
 * A push to a project's default branch is a deploy: record it, read the kit version it carries, then raise the
 * refactor round if it is due. A push to project-process's own default branch also refreshes the latest kit version.
 */
export async function handlePushEvent(
	supabase: SupabaseClient,
	event: unknown,
	deliveryId: string
): Promise<PushOutcome> {
	const deploy = readPushEvent(event, new Date());
	if (deploy === null) return { kind: 'ignored', reason: 'not_a_branch_push' };
	if (isProjectProcessRelease(deploy)) await readLatestKitVersion(supabase, pushedRef(deploy));
	const projects = await findProjectsByRepository(supabase, deploy.repositoryUrl);
	if (projects.length === 0) return { kind: 'ignored', reason: 'no_project_for_repository' };
	const deployed = projects.filter((project) => project.defaultBranch === deploy.branch);
	if (deployed.length === 0) return { kind: 'ignored', reason: 'not_the_default_branch' };
	const outcomes = [];
	for (const project of deployed) outcomes.push(await recordAndRaise(supabase, project, deploy, deliveryId));
	return { kind: 'recorded', projects: outcomes };
}

async function recordAndRaise(
	supabase: SupabaseClient,
	project: Project,
	deploy: PushedDeploy,
	deliveryId: string
): Promise<DeployOutcome> {
	const isNew = await recordDeploy(supabase, { projectId: project.id, deliveryId, deploy });
	const kit = await readKitVersionOfProject(supabase, project, pushedRef(deploy));
	const round = isNew ? await raiseRefactorRoundIfDue(supabase, project) : 'not_due';
	return { projectId: project.id, isNew, round, kit };
}

function isProjectProcessRelease(deploy: PushedDeploy): boolean {
	const isProjectProcess = isSameRepository(deploy.repositoryUrl, projectProcessRepositoryUrl);
	return isProjectProcess && deploy.branch === projectProcessDefaultBranch;
}

/** The commit the push landed, or its branch when GitHub did not name one. */
function pushedRef(deploy: PushedDeploy): string {
	return deploy.commitSha === '' ? deploy.branch : deploy.commitSha;
}
