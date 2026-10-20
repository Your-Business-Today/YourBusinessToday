import { isoDateOf } from '$lib/data/demo/demoDates';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { isDemoToken } from './demoToken';
import { readDemoBusiness, saveDemoBusiness } from './demoStore';
import type { DemoCopy } from './answerDemoRequest';

export const noSuchDemoSentence =
	'There is no demo at this address. Open the demo link you were sent to start one.';

export const demoNotReadySentence = 'The demo is still being set up. Try again shortly.';

/** The copy a token names, ready to read and to keep changes on, or null when the token names none. */
export async function openDemoCopy(token: string): Promise<DemoCopy | null> {
	if (!isDemoToken(token)) return null;
	const supabase = supabaseServiceClient();
	const business = await readDemoBusiness(supabase, token);
	if (business === null) return null;
	return {
		business,
		today: isoDateOf(new Date()),
		save: (changed) => saveDemoBusiness(supabase, token, changed)
	};
}
