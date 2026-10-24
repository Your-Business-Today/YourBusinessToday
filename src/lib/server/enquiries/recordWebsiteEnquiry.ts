import type { SupabaseClient } from '@supabase/supabase-js';
import { addPerson } from '$lib/server/people/addPerson';
import { affiliatePersonWithClient } from '$lib/server/clients/affiliatePersonWithClient';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { findRecentWebsiteEnquiry } from './findRecentWebsiteEnquiry';
import type { WebsiteEnquiry } from '$lib/data/enquiryForm';

export type RecordedEnquiry = { clientId: string; isRepeat: boolean };

const websiteSource = 'website';
const leadStage = 'lead';

export async function recordWebsiteEnquiry(
	supabase: SupabaseClient,
	enquiry: WebsiteEnquiry
): Promise<RecordedEnquiry> {
	const recentClientId = await findRecentWebsiteEnquiry(supabase, enquiry.email);
	if (recentClientId !== null) return { clientId: recentClientId, isRepeat: true };
	const clientId = await insertLead(supabase, enquiry);
	await affiliateEnquirer(supabase, clientId, enquiry);
	await recordClientEvent(
		supabase,
		clientId,
		'enquiry_received',
		{ message: enquiry.message, whenSuits: enquiry.whenSuits, source: websiteSource },
		null
	);
	return { clientId, isRepeat: false };
}

async function insertLead(supabase: SupabaseClient, enquiry: WebsiteEnquiry): Promise<string> {
	const clientName = enquiry.company === '' ? enquiry.name : enquiry.company;
	const { data, error } = await supabase
		.from('clients')
		.insert({
			name: clientName,
			website: enquiry.website,
			lifecycle_stage: leadStage,
			lead_source: websiteSource
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id;
}

async function affiliateEnquirer(
	supabase: SupabaseClient,
	clientId: string,
	enquiry: WebsiteEnquiry
): Promise<void> {
	const { personId } = await addPerson(supabase, {
		name: enquiry.name,
		email: enquiry.email,
		phone: enquiry.phone,
		seniority: '',
		leadSource: websiteSource
	});
	await affiliatePersonWithClient(supabase, {
		personId,
		clientId,
		role: '',
		isPrimary: true,
		source: websiteSource
	});
}
