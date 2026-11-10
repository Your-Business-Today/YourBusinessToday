import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureBusinessBrainPart } from './ensureBusinessBrainPart';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';

/** Who is changing which chatbot of which organisation. */
export type ChatbotGrantPlace = { organisationId: string; chatbotId: string; accountId: string };

/** The id of each part, the brain and the part made first if nothing is filed in them yet. */
export async function ensurePartIds(supabase: SupabaseClient, organisationId: string, parts: BusinessBrainPartKind[]): Promise<string[]> {
	return Promise.all(parts.map((part) => ensureBusinessBrainPart(supabase, organisationId, part)));
}

/** Let the chatbot read each part. */
export async function addChatbotParts(supabase: SupabaseClient, place: ChatbotGrantPlace, parts: BusinessBrainPartKind[]): Promise<void> {
	if (parts.length === 0) return;
	const partIds = await ensurePartIds(supabase, place.organisationId, parts);
	await insertChatbotParts(supabase, place, partIds);
}

/** Let the chatbot read each part, by its id. */
export async function insertChatbotParts(supabase: SupabaseClient, place: ChatbotGrantPlace, partIds: string[]): Promise<void> {
	const rows = partIds.map((partId) => ({ ...grantColumns(place), part_id: partId }));
	const { error } = await supabase.from('business_brain_chatbot_parts').insert(rows);
	if (error) throw error;
}

/** Let each person, named by email, use the chatbot. */
export async function addChatbotMembers(supabase: SupabaseClient, place: ChatbotGrantPlace, emails: string[]): Promise<void> {
	if (emails.length === 0) return;
	const rows = emails.map((email) => ({ ...grantColumns(place), email }));
	const { error } = await supabase.from('business_brain_chatbot_members').insert(rows);
	if (error) throw error;
}

function grantColumns(place: ChatbotGrantPlace) {
	return { organisation_id: place.organisationId, chatbot_id: place.chatbotId, added_by: place.accountId };
}
