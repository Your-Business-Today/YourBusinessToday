import { contextChanges } from '$lib/data/companyContext/contextChanges';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { readContextConfirmation } from './readContextConfirmation';
import { readLatestCompanyContext, readVersionBefore } from './readLatestCompanyContext';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';
import type { ContextChanges } from '$lib/data/companyContext/contextChanges';
import type { ContextConfirmation } from '$lib/data/companyContext/contextConfirmation';

/** The latest version, what it changed since the one before (none for version 1), and whether the client confirmed it. */
export type CompanyContextReading = {
	context: CompanyContextVersion;
	changes: ContextChanges | null;
	confirmation: ContextConfirmation | null;
};

/**
 * The latest company context of a client's organisation; none before the client is set up or runs the prompt.
 * The context's tables are the server's alone, so this reads with the service key: only call it once the caller
 * has been let in to this client, as a contact of theirs on the portal or as staff.
 */
export async function readCompanyContextOfClient(clientId: string): Promise<CompanyContextReading | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, clientId);
	if (organisationId === null) return null;
	const context = await readLatestCompanyContext(service, organisationId);
	if (context === null) return null;
	const earlier = await readVersionBefore(service, organisationId, context);
	const changes = earlier === null ? null : contextChanges(earlier, context);
	const confirmation = await readContextConfirmation(service, organisationId, context.versionNumber);
	return { context, changes, confirmation };
}
