import type { SupabaseClient } from '@supabase/supabase-js';
import type { StaffMember } from '$lib/server/projects/getStaffDirectory';
import { recordClientEvent } from './recordClientEvent';

/** Names the staff member who brought the record in, and writes the change on its history. */
export async function setClientOwner(
	supabase: SupabaseClient,
	clientId: string,
	owner: StaffMember,
	actorAccountId: string
): Promise<void> {
	const { error } = await supabase.from('clients').update({ owner_id: owner.id }).eq('id', clientId);
	if (error) throw error;
	await recordClientEvent(supabase, clientId, 'owner_changed', { to: owner.name }, actorAccountId);
}
