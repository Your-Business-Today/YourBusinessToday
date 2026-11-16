import type { SupabaseClient } from '@supabase/supabase-js';

const signUpsTable = 'newsletter_sign_ups';
const mostForwardedAtOnce = 50;

/** Keeps the address, once: signing up again changes nothing. */
export async function recordNewsletterSignUp(
	supabase: SupabaseClient,
	email: string
): Promise<void> {
	const { error } = await supabase
		.from(signUpsTable)
		.upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
	if (error) throw error;
}

/** The addresses the newsletter has not taken yet, the earliest first. */
export async function findWaitingSignUps(supabase: SupabaseClient): Promise<string[]> {
	const { data, error } = await supabase
		.from(signUpsTable)
		.select('email')
		.is('forwarded_to_newsletter_at', null)
		.order('signed_up_at')
		.limit(mostForwardedAtOnce);
	if (error) throw error;
	return data.map((signUp) => signUp.email);
}

export async function markSignUpForwarded(supabase: SupabaseClient, email: string): Promise<void> {
	const { error } = await supabase
		.from(signUpsTable)
		.update({ forwarded_to_newsletter_at: new Date().toISOString() })
		.eq('email', email);
	if (error) throw error;
}
