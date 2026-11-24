import type { BrandKitOwner } from './brandKitOwner';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrandSummaryGiven = { owner: BrandKitOwner; summary: string; accountId: string };

/** What describing the brand did: made the brand, or replaced the sentence it had. */
export type BrandSummaryKept = { isNew: true } | { isNew: false; earlierSummary: string };

const uniqueViolation = '23505';

/** The brand's summary, or null while there is no brand. */
export async function findBrandSummary(supabase: SupabaseClient, owner: BrandKitOwner): Promise<string | null> {
	const { data, error } = await supabase
		.from(owner.kitsTable)
		.select('summary')
		.eq(owner.ownerColumn, owner.ownerId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.summary as string;
}

/** Keeps what the brand is: an organisation or product with no brand gets one, and one with a brand has its sentence replaced. */
export async function keepBrandSummary(supabase: SupabaseClient, given: BrandSummaryGiven): Promise<BrandSummaryKept> {
	const earlierSummary = await findBrandSummary(supabase, given.owner);
	if (earlierSummary === null) return startBrand(supabase, given);
	await replaceSummary(supabase, given);
	return { isNew: false, earlierSummary };
}

async function startBrand(supabase: SupabaseClient, given: BrandSummaryGiven): Promise<BrandSummaryKept> {
	const { owner } = given;
	const row = { [owner.ownerColumn]: owner.ownerId, summary: given.summary, created_by: given.accountId };
	const { error } = await supabase.from(owner.kitsTable).insert(row);
	if (error?.code === uniqueViolation) return keepBrandSummary(supabase, given);
	if (error) throw error;
	return { isNew: true };
}

async function replaceSummary(supabase: SupabaseClient, given: BrandSummaryGiven): Promise<void> {
	const { owner } = given;
	const { error } = await supabase
		.from(owner.kitsTable)
		.update({ summary: given.summary, updated_at: new Date().toISOString() })
		.eq(owner.ownerColumn, owner.ownerId);
	if (error) throw error;
}
