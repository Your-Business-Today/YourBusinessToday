import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PartMark } from './validatePartMark';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who is marking a part, and of which client: a contact of theirs, already let in to the portal. */
export type PartMarker = { clientId: string; accountId: string };

const noContextYet: Refusal = { refusal: 'Your company context has not been recorded yet, so there is nothing to mark.' };
const noSuchPart: Refusal = { refusal: 'That part is not in this version of your company context.' };

/**
 * Keeps a client's mark on one part of the latest version as a row of its own, beside the marks before it. The
 * context's tables are the server's alone, so this writes with the service key: only call it once the caller has
 * been let in to this client as a contact of theirs.
 */
export async function markContextPart(marker: PartMarker, mark: PartMark): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, marker.clientId);
	if (organisationId === null) return noContextYet;
	const latest = await readLatestVersion(service, organisationId);
	if (latest === null) return noContextYet;
	if (latest.versionNumber !== mark.versionNumber) return newerVersionRecorded(latest.versionNumber);
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

function newerVersionRecorded(versionNumber: number): Refusal {
	return { refusal: `Version ${versionNumber} has been recorded since you opened the map: reload it and mark it there.` };
}

async function readLatestVersion(service: SupabaseClient, organisationId: string) {
	const { data, error } = await service
		.from('company_context_versions')
		.select('id, version_number')
		.eq('organisation_id', organisationId)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { id: String(data.id), versionNumber: Number(data.version_number) };
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
