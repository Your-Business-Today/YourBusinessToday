import { isAdmittedBy, wasMadeBeforeCutOff } from './admissionFacts';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AccountToAdmit = {
	accountId: string;
	createdAt: string | null | undefined;
};

/**
* Whether a signed-in account may use Your Business Today, or only reach the contact page.
* It is not an open service: someone who signs up waits until they are brought onto an organisation or a project, or made staff.
*/
export async function isAdmitted(
	supabase: SupabaseClient,
	account: AccountToAdmit,
): Promise<boolean> {
	if (wasMadeBeforeCutOff(account.createdAt)) return true;
	const { accountId } = account;
	const [isStaff, isOnAnOrganisation, wasAddedToAProject, isClientContact] =
		await Promise.all([
			isStaffAccount(supabase, accountId),
			hasAnyRow(rowsOfAccount(supabase, 'organisation_members', accountId)),
			hasAnyRow(
				rowsOfAccount(supabase, 'project_members', accountId).neq(
					'added_by',
					accountId,
				),
			),
			hasAnyRow(rowsOfAccount(supabase, 'client_contacts', accountId)),
		]);
	const facts = {
		wasMadeBeforeCutOff: false,
		isStaff,
		isOnAnOrganisation,
		wasAddedToAProject,
		isClientContact,
	};
	return isAdmittedBy(facts);
}

function rowsOfAccount(
	supabase: SupabaseClient,
	table: string,
	accountId: string,
) {
	return supabase
		.from(table)
		.select('account_id', { count: 'exact', head: true })
		.eq('account_id', accountId);
}

async function isStaffAccount(
	supabase: SupabaseClient,
	accountId: string,
): Promise<boolean> {
	const { data, error } = await supabase
		.from('profiles')
		.select('is_staff, is_admin')
		.eq('id', accountId)
		.maybeSingle();
	if (error) throw error;
	return data?.is_staff === true || data?.is_admin === true;
}

type CountReading = PromiseLike<{ count: number | null; error: unknown }>;

async function hasAnyRow(reading: CountReading): Promise<boolean> {
	const { count, error } = await reading;
	if (error) throw error;
	return (count ?? 0) > 0;
}
