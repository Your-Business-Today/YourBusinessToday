import type { SupabaseClient } from '@supabase/supabase-js';
import { outcodeOf } from '$lib/data/postcode';
import type { AreaEventKind } from '$lib/data/areaEventKind';

/** What a command says happened: the sector it happened in, what, to whom, and who did it. */
export type AreaEventSeed = {
	sector: string;
	patchId: string | null;
	kind: AreaEventKind;
	actorAccountId: string | null;
	companyNumber?: string;
	sightingId?: string | null;
	clientId?: string | null;
	detail?: string;
	sourceUrl?: string;
	sourceKey?: string;
	happenedAt?: string | null;
};

/** The one door every area event goes through: the database's own function, which refuses anyone but staff. */
export async function recordAreaEvent(supabase: SupabaseClient, seed: AreaEventSeed): Promise<void> {
	const { error } = await supabase.rpc('record_area_event', {
		event_outcode: outcodeOf(seed.sector),
		event_sector: seed.sector,
		event_patch_id: seed.patchId,
		event_kind: seed.kind,
		event_company_number: seed.companyNumber ?? '',
		event_sighting_id: seed.sightingId ?? null,
		event_client_id: seed.clientId ?? null,
		event_detail: seed.detail ?? '',
		event_source_url: seed.sourceUrl ?? '',
		event_source_key: seed.sourceKey ?? '',
		event_happened_at: seed.happenedAt ?? null,
		event_actor: seed.actorAccountId
	});
	if (error) throw error;
}
