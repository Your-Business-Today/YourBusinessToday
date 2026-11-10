import type { SupabaseClient } from '@supabase/supabase-js';

export type BrandSummaryGiven = { organisationId: string; summary: string; accountId: string };

/** What describing the brand did: made the organisation its brand, or replaced the sentence it had. */
export type BrandSummaryKept = { isNew: true } | { isNew: false; earlierSummary: string };

const uniqueViolation = '23505';

/** The organisation's brand summary, or null while the organisation has no brand. */
export async function findBrandSummary(supabase: SupabaseClient, organisationId: string): Promise<string | null> {
	const { data, error } = await supabase
		.from('brand_kits')
		.select('summary')
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.summary as string;
}

/** Keeps what the brand is: an organisation with no brand gets one, and one with a brand has its sentence replaced. */
export async function keepBrandSummary(supabase: SupabaseClient, given: BrandSummaryGiven): Promise<BrandSummaryKept> {
	const earlierSummary = await findBrandSummary(supabase, given.organisationId);
	if (earlierSummary === null) return startBrand(supabase, given);
	await replaceSummary(supabase, given);
	return { isNew: false, earlierSummary };
}

async function startBrand(supabase: SupabaseClient, given: BrandSummaryGiven): Promise<BrandSummaryKept> {
	const row = { organisation_id: given.organisationId, summary: given.summary, created_by: given.accountId };
	const { error } = await supabase.from('brand_kits').insert(row);
	if (error?.code === uniqueViolation) return keepBrandSummary(supabase, given);
	if (error) throw error;
	return { isNew: true };
}

async function replaceSummary(supabase: SupabaseClient, given: BrandSummaryGiven): Promise<void> {
	const { error } = await supabase
		.from('brand_kits')
		.update({ summary: given.summary, updated_at: new Date().toISOString() })
		.eq('organisation_id', given.organisationId);
	if (error) throw error;
}
