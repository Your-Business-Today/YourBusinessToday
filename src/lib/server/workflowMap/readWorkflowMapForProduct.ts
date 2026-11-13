import { isBusinessBrainOpen } from '$lib/server/organisations/isBusinessBrainOpen';
import { readOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { readOrganisationWorkflowMaps } from './readOrganisationWorkflowMaps';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { productMapReadings, type ProductMapReading } from '$lib/data/workflowMap/productMapReading';
import type { Project } from '$lib/server/projects/projectRecord';

/**
 * The organisation's workflow map as a product's tab draws it. The map is read past row level security, as the
 * organisation's own page reads it, only once the visitor is known to reach the organisation and its brain.
 */
export async function readWorkflowMapForProduct(locals: App.Locals, project: Project): Promise<ProductMapReading> {
	const { organisationId } = project;
	if (organisationId === null) return { kind: productMapReadings.noOrganisation };
	const access = await readOrganisationAccess(locals, organisationId);
	if (access === null) return { kind: productMapReadings.noOrganisation };
	const { organisation } = access;
	const isBrainOpen = await isBusinessBrainOpen(locals.supabase, access);
	if (!isBrainOpen)
		return {
			kind: productMapReadings.brainClosed,
			organisationName: organisation.name
		};
	const maps = await readOrganisationWorkflowMaps(supabaseServiceClient(), organisation.id);
	return {
		kind: productMapReadings.read,
		organisationId: organisation.id,
		organisationName: organisation.name,
		maps
	};
}
