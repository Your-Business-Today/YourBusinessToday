import { canConfirm, confirmationHeldBack } from '$lib/data/companyContext/contextConfirmation';
import { findLatestVersion, newerVersionRecorded } from './findLatestVersion';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { notifyContextConfirmed } from './notifyContextConfirmed';
import { readContextParts } from './readContextParts';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { tallyReviews } from '$lib/data/companyContext/reviewTally';
import type { PartMarker } from './markContextPart';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A client contact confirming their organisation's context, and the site they did it on, for the link to staff. */
export type ContextConfirmer = PartMarker & { organisationName: string; siteOrigin: string };

const uniqueViolation = '23505';
const nothingToConfirm: Refusal = {
	refusal: 'Your company context has not been recorded yet, so there is nothing to confirm.'
};
export const alreadyConfirmedVersion: Refusal = { refusal: 'You have already confirmed this version.' };

/**
 * Keeps the latest version as the client's confirmed context, once no part of it is marked not right, then tells
 * YBT: the client's history records it and the staff inbox is emailed. The context's tables are the server's
 * alone, so this writes with the service key: only call it once the caller has been let in to this client.
 */
export async function confirmCompanyContext(confirmer: ContextConfirmer, versionNumber: number): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, confirmer.clientId);
	if (organisationId === null) return nothingToConfirm;
	const latest = await findLatestVersion(service, organisationId);
	if (latest === null) return nothingToConfirm;
	if (latest.versionNumber !== versionNumber) return newerVersionRecorded(latest.versionNumber);
	const { parts } = await readContextParts(service, latest.id);
	const tally = tallyReviews(parts);
	if (!canConfirm(tally)) return { refusal: confirmationHeldBack(tally) };
	const isNewlyConfirmed = await keepConfirmation(service, latest.id, confirmer.accountId);
	if (!isNewlyConfirmed) return alreadyConfirmedVersion;
	await tellYbt(service, confirmer, versionNumber);
	return null;
}

async function keepConfirmation(service: SupabaseClient, versionId: string, accountId: string): Promise<boolean> {
	const { error } = await service
		.from('company_context_confirmations')
		.insert({ version_id: versionId, confirmed_by: accountId });
	if (error?.code === uniqueViolation) return false;
	if (error) throw error;
	return true;
}

async function tellYbt(service: SupabaseClient, confirmer: ContextConfirmer, versionNumber: number): Promise<void> {
	const { clientId, accountId, organisationName, siteOrigin } = confirmer;
	await recordClientEvent(service, clientId, 'context_confirmed', { versionNumber }, accountId);
	const contextUrl = `${siteOrigin}/clients/${clientId}/context`;
	await notifyContextConfirmed({ organisationName, versionNumber, contextUrl });
}
