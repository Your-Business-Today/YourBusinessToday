import type { SupabaseClient } from '@supabase/supabase-js';
import { addChatbotMembers, addChatbotParts, type ChatbotGrantPlace } from './grantBusinessBrainChatbot';
import { removeChatbotMembers, removeChatbotParts } from './withdrawBusinessBrainChatbot';
import type { BusinessBrainChatbot, BusinessBrainChatbotChange } from '$lib/data/businessBrainChatbotRules';

/**
 * Change what a chatbot is for, what it reads and who uses it. Only what is not already so is written: a part it
 * already reads or a person already on it is not added twice, and one not on it is not taken away.
 */
export async function changeBusinessBrainChatbot(
	supabase: SupabaseClient,
	place: ChatbotGrantPlace,
	standing: BusinessBrainChatbot,
	change: BusinessBrainChatbotChange
): Promise<void> {
	const newParts = change.addParts.filter((part) => !standing.parts.includes(part));
	const goneParts = change.removeParts.filter((part) => standing.parts.includes(part));
	const newPeople = change.addPeople.filter((email) => !standing.people.includes(email));
	const gonePeople = change.removePeople.filter((email) => standing.people.includes(email));
	await changeChatbotPurpose(supabase, place, standing, change.purpose);
	await addChatbotParts(supabase, place, newParts);
	await removeChatbotParts(supabase, place, goneParts);
	await addChatbotMembers(supabase, place, newPeople);
	await removeChatbotMembers(supabase, place, gonePeople);
}

async function changeChatbotPurpose(supabase: SupabaseClient, place: ChatbotGrantPlace, standing: BusinessBrainChatbot, purpose: string | null) {
	const isUnchanged = purpose === null || purpose === standing.purpose;
	if (isUnchanged) return;
	const { error } = await supabase
		.from('business_brain_chatbots')
		.update({ purpose })
		.eq('id', place.chatbotId)
		.eq('organisation_id', place.organisationId);
	if (error) throw error;
}
