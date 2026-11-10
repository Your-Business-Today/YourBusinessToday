import type { SupabaseClient } from '@supabase/supabase-js';
import { organisationDetailColumns } from './organisationRecord';
import type { OrganisationDetails } from '$lib/data/organisationRules';

export type NewOrganisationSeed = {
	details: OrganisationDetails;
	createdBy: string;
};

/** Returns the new organisation's id, or null when an organisation of that name already exists. */
export async function createOrganisation(
	supabase: SupabaseClient,
	seed: NewOrganisationSeed
): Promise<string | null> {
	const { data, error } = await supabase
		.from('organisations')
		.insert({
			...organisationDetailColumns(seed.details),
			created_by: seed.createdBy
		})
		.select('id')
		.maybeSingle();
	if (error !== null && isDuplicateName(error)) return null;
	if (error) throw error;
	return (data?.id as string) ?? null;
}

const uniqueViolation = '23505';

function isDuplicateName(error: { code?: string }): boolean {
	return error.code === uniqueViolation;
}
