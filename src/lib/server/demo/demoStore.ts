import type { SupabaseClient } from '@supabase/supabase-js';
import type { DemoBusiness } from '$lib/data/demo/demoBusiness';
import { firstDemoKind, type DemoKindValue } from '$lib/data/demo/demoKinds';

const table = 'demo_businesses';

type StoredDemoBusiness = Omit<DemoBusiness, 'kind'> & { kind?: DemoKindValue };

export async function createDemoBusiness(
	supabase: SupabaseClient,
	token: string,
	business: DemoBusiness
): Promise<void> {
	const { error } = await supabase.from(table).insert({ token, business });
	if (error) throw error;
}

/** The prospect's copy, or null when no demo was ever started under that token. */
export async function readDemoBusiness(
	supabase: SupabaseClient,
	token: string
): Promise<DemoBusiness | null> {
	const { data, error } = await supabase.from(table).select('business').eq('token', token).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const stored = data.business as StoredDemoBusiness;
	return { ...stored, kind: stored.kind ?? firstDemoKind };
}

export async function saveDemoBusiness(
	supabase: SupabaseClient,
	token: string,
	business: DemoBusiness
): Promise<void> {
	const { error } = await supabase
		.from(table)
		.update({ business, last_used_at: new Date().toISOString() })
		.eq('token', token);
	if (error) throw error;
}
