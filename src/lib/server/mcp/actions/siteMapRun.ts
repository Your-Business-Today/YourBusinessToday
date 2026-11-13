import { describeSiteMapRun } from './describeSiteMapRun';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getProjectBlueprint } from '$lib/server/blueprint/getProjectBlueprint';
import { mapStage, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import { noSuchProject } from './describeProject';
import { readHeadCommit } from '$lib/server/productRepository/readHeadCommit';
import { readLatestJourneyMap } from '$lib/server/journeyMap/readLatestJourneyMap';
import { readLatestWorkflowMap } from '$lib/server/workflowMap/readLatestWorkflowMap';
import { readText } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { McpCaller } from '../resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The walk a person's Claude follows to map a product's site as journeys, fitted to what is held already. */
export async function startSiteMapRun(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const { supabase } = caller;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	const { id, organisationId, repositoryUrl, defaultBranch } = project;
	const [headCommit, journeyMap, blueprint, organisation, workflowMap] = await Promise.all([
		readHeadCommit(repositoryUrl, defaultBranch),
		readLatestJourneyMap(supabase, id),
		getProjectBlueprint(supabase, id),
		organisationId === null ? null : getOrganisation(supabase, organisationId),
		workflowMapOf(supabase, organisationId)
	]);
	const organisationName = organisation?.name ?? null;
	const siteDefinition = blueprint?.siteMap ?? null;
	return describeSiteMapRun({ project, organisationName, headCommit, journeyMap, siteDefinition, workflowMap });
}

/** The organisation's latest After map, which is how it works with our products in it, or its Before when that is all. */
async function workflowMapOf(supabase: SupabaseClient, organisationId: string | null): Promise<WorkflowMapVersion | null> {
	if (organisationId === null) return null;
	const after = await readLatestWorkflowMap(supabase, organisationId, mapStage.after);
	if (after !== null) return after;
	return readLatestWorkflowMap(supabase, organisationId, mapStage.before);
}
