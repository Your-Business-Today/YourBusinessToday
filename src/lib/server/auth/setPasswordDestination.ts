import { defaultDestination, homeDestinationFor, localDestinationOrDefault } from './localDestination';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The query parameter and form field that carry where a person goes once their password is set. */
export const nextDestinationField = 'next';

/** The same-site page the set-password link named, or an empty string when it named none. */
export function readNextDestination(requested: string | null): string {
	const destination = localDestinationOrDefault(requested);
	if (destination === defaultDestination) return '';
	return destination;
}

/** Where a person goes once their password is set: the page their link named, otherwise their home. */
export async function destinationAfterSettingPassword(
	supabase: SupabaseClient,
	accountId: string,
	nextDestination: string
): Promise<string> {
	if (nextDestination !== '') return nextDestination;
	return homeDestinationFor(supabase, accountId);
}
