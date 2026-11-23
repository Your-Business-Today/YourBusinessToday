import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

const termsAcceptancesTable = 'terms_acceptances';
const uniqueViolationCode = '23505';

export type TermsAcceptance = {
	accountId: string;
	termsVersion: string;
};

/**
 * Whether an account has accepted this version of the terms.
 * Until the migration that keeps acceptances has run, nobody is held back, since nobody could accept.
 */
export async function hasAcceptedTerms(
	supabase: SupabaseClient,
	acceptance: TermsAcceptance
): Promise<boolean> {
	const { count, error } = await supabase
		.from(termsAcceptancesTable)
		.select('account_id', { count: 'exact', head: true })
		.eq('account_id', acceptance.accountId)
		.eq('terms_version', acceptance.termsVersion);
	if (isSchemaNotYetMigrated(error)) return true;
	if (error) throw error;
	return (count ?? 0) > 0;
}

/** Keeps an account's acceptance of a version of the terms. Accepting a version already accepted keeps the first acceptance. */
export async function recordTermsAcceptance(
	supabase: SupabaseClient,
	acceptance: TermsAcceptance
): Promise<void> {
	const { error } = await supabase.from(termsAcceptancesTable).insert({
		account_id: acceptance.accountId,
		terms_version: acceptance.termsVersion
	});
	if (error === null) return;
	if (error.code === uniqueViolationCode) return;
	throw error;
}
