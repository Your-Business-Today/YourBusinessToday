import type { SupabaseClient } from '@supabase/supabase-js';
import type { RankChange } from './rankChanges';

/**
 * A new order is written by one database function in one statement (migration
 * 0142), so it saves whole or not at all. Writing one row per request, all at
 * once, deadlocked on the project board and left the order half-saved.
 */
export type RankColumns = { ids: string[]; ranks: number[] };

export function rankColumnsOf(changes: RankChange[]): RankColumns {
	return {
		ids: changes.map((change) => change.id),
		ranks: changes.map((change) => change.rank)
	};
}

export async function saveRanks(
	supabase: SupabaseClient,
	functionName: string,
	functionArguments: Record<string, string | string[] | number[]>
): Promise<void> {
	const { error } = await supabase.rpc(functionName, functionArguments);
	if (error) throw error;
}
