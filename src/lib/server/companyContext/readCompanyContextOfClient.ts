import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { readLatestCompanyContext } from './readLatestCompanyContext';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

/**
 * The latest company context of a client's organisation; none before the client is set up or runs the prompt.
 * The context's tables are the server's alone, so this reads with the service key: only call it once the caller
 * has been let in to this client, as a contact of theirs on the portal or as staff.
 */
export async function readCompanyContextOfClient(clientId: string): Promise<CompanyContextVersion | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, clientId);
	if (organisationId === null) return null;
	return readLatestCompanyContext(service, organisationId);
}
