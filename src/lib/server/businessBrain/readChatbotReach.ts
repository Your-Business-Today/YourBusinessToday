import type { SupabaseClient } from '@supabase/supabase-js';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { readBusinessBrainChatbots } from './readBusinessBrainChatbots';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** A chatbot a person may use now, with the organisation whose brain it reads. */
export type ChatbotReach = { organisation: Organisation; chatbot: BusinessBrainChatbot };

type ChatbotMembership = { chatbot_id: string; organisation_id: string };

const businessBrainModule = 'business_brain';

/** Every chatbot the person signed in with this email may use now, by organisation and name. */
export async function readChatbotsForPerson(supabase: SupabaseClient, email: string): Promise<ChatbotReach[]> {
	const memberships = await readCurrentMemberships(supabase, email, null);
	const reaches = await Promise.all(memberships.map((membership) => reachOf(supabase, membership)));
	return reaches.filter((reach): reach is ChatbotReach => reach !== null).sort(byOrganisationThenName);
}

/**
 * The chatbot, when the person signed in with this email is one it names now and its organisation has
 * Your Business Brain switched on; otherwise null, so nothing is read through it.
 */
export async function readChatbotReach(supabase: SupabaseClient, chatbotId: string, email: string): Promise<ChatbotReach | null> {
	const [membership] = await readCurrentMemberships(supabase, email, chatbotId);
	if (membership === undefined) return null;
	return reachOf(supabase, membership);
}

async function readCurrentMemberships(supabase: SupabaseClient, email: string, chatbotId: string | null): Promise<ChatbotMembership[]> {
	const signedInEmail = email.trim().toLowerCase();
	if (signedInEmail === '') return [];
	let query = supabase
		.from('business_brain_chatbot_members')
		.select('chatbot_id, organisation_id')
		.eq('email', signedInEmail)
		.is('removed_at', null);
	if (chatbotId !== null) query = query.eq('chatbot_id', chatbotId);
	const { data, error } = await query;
	if (error) throw error;
	return (data ?? []) as ChatbotMembership[];
}

async function reachOf(supabase: SupabaseClient, membership: ChatbotMembership): Promise<ChatbotReach | null> {
	const organisation = await getOrganisation(supabase, membership.organisation_id);
	if (organisation === null) return null;
	const switchedOn = await getSwitchedOnModules(supabase, organisation.id);
	const hasBrainOn = switchedOn.includes(businessBrainModule);
	if (!hasBrainOn) return null;
	const [chatbot] = await readBusinessBrainChatbots(supabase, organisation.id, membership.chatbot_id);
	if (chatbot === undefined) return null;
	return { organisation, chatbot };
}

function byOrganisationThenName(left: ChatbotReach, right: ChatbotReach): number {
	const [leftOrganisation, leftChatbot] = namesOf(left);
	const [rightOrganisation, rightChatbot] = namesOf(right);
	const byOrganisation = leftOrganisation.localeCompare(rightOrganisation);
	if (byOrganisation !== 0) return byOrganisation;
	return leftChatbot.localeCompare(rightChatbot);
}

function namesOf({ organisation, chatbot }: ChatbotReach): [string, string] {
	return [organisation.name, chatbot.name];
}
