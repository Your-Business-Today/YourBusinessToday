import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdminPinnedModel } from './getAdminPinnedModel';
import { getUserModelPreference } from './userModelPreference';

/**
 * Admin pin first, then the user's own slider choice; null means the site
 * default applies. Both reads are RLS-scoped to the caller's own rows, and
 * a failed read throws: a question priced on a guessed rung is a question
 * priced wrong, so the request fails before any credit is reserved.
 */
export async function getUserModelOverride(supabase: SupabaseClient): Promise<string | null> {
	return (await getAdminPinnedModel(supabase)) ?? (await getUserModelPreference(supabase));
}
