import { moduleNotSwitchedOn, usableModuleOrganisation } from '../organisationModuleGate';
import { readText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const salesOrganisationField = textField(
	"The organisation whose register it is, as list_organisations gives it. Leave it out for Your Business Today's own"
);

export const salesNotSwitchedOn = moduleNotSwitchedOn('sales');

/** The organisation a sales action works on: the one named, else Your Business Today's own; null where Sales is off or out of reach. */
export async function salesOrganisationOf(caller: McpCaller, input: Record<string, unknown>): Promise<Organisation | null> {
	const namedId = readText(input, 'organisationId');
	const organisationId = namedId === '' ? await yourBusinessTodayOrganisationId(caller) : namedId;
	return salesOrganisationWithId(caller, organisationId);
}

/** The organisation with this id, while Sales is switched on for it and the caller reaches it; null otherwise. */
export async function salesOrganisationWithId(caller: McpCaller, organisationId: string): Promise<Organisation | null> {
	if (organisationId === '') return null;
	return usableModuleOrganisation(caller, organisationId, 'sales');
}

async function yourBusinessTodayOrganisationId(caller: McpCaller): Promise<string> {
	const { data, error } = await caller.supabase.rpc('your_business_today_organisation_id');
	if (error) throw error;
	return (data ?? '') as string;
}
