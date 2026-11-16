import type { SupabaseClient } from '@supabase/supabase-js';
import { getClient } from './getClient';
import { parseCompanyProfileForm } from './companyProfile';
import { renameClient } from './renameClient';
import { updateCompanyProfile } from './updateCompanyProfile';
import { validateCompanyName } from './validateCompanyName';
import { validateCompanyProfileForm } from './validateCompanyProfileForm';

export const noSuchCompany = 'There is no such company on the register.';

/** Saves the company page's profile form, the name first: null when saved, else the sentence saying why it was not. */
export async function saveCompanyProfileForm(
	supabase: SupabaseClient,
	clientId: string,
	formData: FormData,
	actorAccountId: string
): Promise<string | null> {
	const naming = validateCompanyName(formData.get('name'));
	if (typeof naming === 'string') return naming;
	const refusal = validateCompanyProfileForm(formData);
	if (refusal !== null) return refusal;
	const client = await getClient(supabase, clientId);
	if (client === null) return noSuchCompany;
	const website = String(formData.get('website') ?? '').trim();
	await renameClient(supabase, client, naming.name, actorAccountId);
	await updateCompanyProfile(supabase, client.id, website, parseCompanyProfileForm(formData));
	return null;
}
