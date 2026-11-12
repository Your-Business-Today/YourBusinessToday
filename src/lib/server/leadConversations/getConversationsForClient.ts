import type { SupabaseClient } from '@supabase/supabase-js';
import { getStaffDirectory } from '$lib/server/projects/getStaffDirectory';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { ConversationChannel, LeadConversation } from '$lib/data/leadConversationRules';

const someoneUnnamed = 'Someone';
const nobodyNamed = '';
const conversationColumns = 'id, person_id, held_by_account_id, held_on, channel, summary, deal_points, logged_at, people (name)';

/** Every conversation kept on a lead, the latest first, with who had it on each side. */
export async function getConversationsForClient(supabase: SupabaseClient, clientId: string): Promise<LeadConversation[]> {
	const [{ data, error }, staffMembers] = await Promise.all([
		supabase
			.from('lead_conversations')
			.select(conversationColumns)
			.eq('client_id', clientId)
			.order('held_on', { ascending: false })
			.order('logged_at', { ascending: false }),
		getStaffDirectory(supabase)
	]);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const staffNames = new Map(staffMembers.map((member) => [member.id, member.name]));
	return (data as Record<string, unknown>[]).map((row) => parseConversation(row, staffNames));
}

function parseConversation(row: Record<string, unknown>, staffNames: Map<string, string>): LeadConversation {
	const person = row.people as { name: string } | null;
	const heldBy = (row.held_by_account_id ?? null) as string | null;
	return {
		id: row.id as string,
		personId: (row.person_id ?? null) as string | null,
		personName: person?.name ?? nobodyNamed,
		heldByName: heldBy === null ? someoneUnnamed : (staffNames.get(heldBy) ?? someoneUnnamed),
		heldOn: row.held_on as string,
		channel: row.channel as ConversationChannel,
		summary: row.summary as string,
		dealPoints: row.deal_points as string,
		loggedAt: row.logged_at as string
	};
}
