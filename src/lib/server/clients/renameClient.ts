import type { SupabaseClient } from '@supabase/supabase-js';
import { recordClientEvent } from './recordClientEvent';

export type ClientName = { id: string; name: string };

/** Corrects a company's name on the register and writes the old name and the new one into its history; a name that has not changed writes nothing. */
export async function renameClient(
	supabase: SupabaseClient,
	client: ClientName,
	newName: string,
	actorAccountId: string
): Promise<boolean> {
	if (newName === client.name) return false;
	const { error } = await supabase.from('clients').update({ name: newName }).eq('id', client.id);
	if (error) throw error;
	await recordClientEvent(supabase, client.id, 'renamed', { from: client.name, to: newName }, actorAccountId);
	return true;
}
