import { validateRecordId } from '$lib/data/isUuid';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The organisation the caller names, when they reach it; otherwise why not. */
export async function contextOrganisation(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<Organisation | string> {
	const organisationId = readText(input, 'organisationId');
	const refusal = validateRecordId('organisationId', organisationId);
	if (refusal !== null) return refusal;
	const organisation = await reachableOrganisation(caller, organisationId);
	return organisation ?? noSuchOrganisation;
}
