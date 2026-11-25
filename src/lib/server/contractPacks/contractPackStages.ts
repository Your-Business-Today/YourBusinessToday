import { contractPackTable } from './contractPackTables';
import type { ContractPackStage } from '$lib/data/contractPackRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The stages a pack moves on from when YBT sends it, the client opens it, comments on it or signs the last document, or YBT countersigns it. */
const movesOnFrom: Record<Exclude<ContractPackStage, 'drafted'>, ContractPackStage[]> = {
	sent: ['drafted'],
	viewed: ['sent'],
	commented: ['sent', 'viewed'],
	signed_by_client: ['sent', 'viewed', 'commented'],
	countersigned: ['signed_by_client']
};

type PackMove = keyof typeof movesOnFrom;

/** Moves the pack on to the stage a step brings it to, never back from a later one. */
export async function moveContractPackOn(supabase: SupabaseClient, packId: string, stage: PackMove, extra: Record<string, string> = {}): Promise<void> {
	const { error } = await supabase
		.from(contractPackTable)
		.update({ stage, ...extra })
		.eq('id', packId)
		.in('stage', movesOnFrom[stage]);
	if (error !== null) throw error;
}
