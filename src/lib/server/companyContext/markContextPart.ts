import { findLatestVersion, newerVersionRecorded } from './findLatestVersion';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { readContextConfirmation } from './readContextConfirmation';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PartMark } from './validatePartMark';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who is acting on a client's context: a contact of theirs, already let in to the portal. */
export type PartMarker = { clientId: string; accountId: string };

export const noContextYet: Refusal = {
	refusal: 'Your company context has not been recorded yet, so there is nothing to mark.'
};
const noSuchPart: Refusal = { refusal: 'That part is not in this version of your company context.' };
const alreadyConfirmed: Refusal = {
	refusal:
		'You have confirmed this version, so it is kept as it is. Tell your Claude what has changed: its revised ' +
		'version is yours to check and confirm again.'
};

/**
 * Keeps a client's mark on one part of the latest version as a row of its own, beside the marks before it. A
 * confirmed version is kept as it was confirmed, so it takes no more marks. The context's tables are the server's
 * alone, so this writes with the service key: only call it once the caller has been let in to this client.
 */
export async function markContextPart(marker: PartMarker, mark: PartMark): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, marker.clientId);
	if (organisationId === null) return noContextYet;
	const latest = await findLatestVersion(service, organisationId);
	if (latest === null) return noContextYet;
	if (latest.versionNumber !== mark.versionNumber) return newerVersionRecorded(latest.versionNumber);
	const confirmation = await readContextConfirmation(service, organisationId, latest.versionNumber);
	if (confirmation !== null) return alreadyConfirmed;
	const partId = await findPartId(service, latest.id, mark.partKey);
	if (partId === null) return noSuchPart;
	const { error } = await service.from('company_context_part_reviews').insert({
		part_id: partId,
		review_state: mark.reviewState,
		what_is_wrong: mark.whatIsWrong,
		reviewed_by: marker.accountId
	});
	if (error) throw error;
	return null;
}

async function findPartId(service: SupabaseClient, versionId: string, partKey: string): Promise<string | null> {
	const { data, error } = await service
		.from('company_context_parts')
		.select('id')
		.eq('version_id', versionId)
		.eq('part_key', partKey)
		.maybeSingle();
	if (error) throw error;
	return data === null ? null : String(data.id);
}
