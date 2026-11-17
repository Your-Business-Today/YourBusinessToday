import { error } from '@sveltejs/kit';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { getClient } from './getClient';
import { keepOnItsRegister } from '$lib/server/salesRegisters/keepOnItsRegister';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Client } from './clientRecord';

const notFound = 404;

export type LeadOfPage = { client: Client; organisationId: string | null };

type LeadAddress = { url: URL; params: { register: string; clientId: string } };

/**
 * The company a tab of its own page shows, kept on the register its stage puts it on, with the organisation opened
 * for it, if one has been. Only staff reach a company's page.
 */
export async function readLeadOfPage(locals: App.Locals, { url, params }: LeadAddress): Promise<LeadOfPage> {
	await requireStaff(locals);
	const client = await getClient(locals.supabase, params.clientId);
	if (client === null) error(notFound, 'That company could not be found');
	keepOnItsRegister(url, params.register, client.stage);
	const organisationId = await findOrganisationOfClient(supabaseServiceClient(), client.id);
	return { client, organisationId };
}
