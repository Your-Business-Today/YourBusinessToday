import type { SupabaseClient } from '@supabase/supabase-js';
import { addClientContact } from '$lib/server/clients/addClientContact';
import { createClient, type NewClientSeed } from '$lib/server/clients/createClient';
import { emptyCompanyProfile } from '$lib/server/clients/companyProfile';
import { fileEmail } from '$lib/server/filedEmails/fileEmail';
import { findPersonByEmail } from '$lib/server/people/findPerson';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import type { StaffMember } from '$lib/server/projects/getStaffDirectory';
import type { EmailDetails } from '$lib/data/filedEmailRules';
import type { LeadEnquiry, LeadFromEmailOutcome, NewLead } from './leadFromEmail';

const emailChannel = 'Email';
const noWebsite = '';
const noRole = '';

/** Puts a checked lead on the register: the company, the person who wrote as its main contact, and their email filed under it. */
export async function addLeadFromEmail(
	supabase: SupabaseClient,
	{ lead, email }: LeadEnquiry,
	broughtInBy: StaffMember,
	actorAccountId: string
): Promise<LeadFromEmailOutcome> {
	const clientId = await createClient(supabase, clientSeedOf(lead, broughtInBy), actorAccountId);
	const personId = await listSender(supabase, clientId, lead, email.from, actorAccountId);
	const filing = await fileEmail(supabase, { ...email, clientId, personId }, actorAccountId);
	await recordClientEvent(supabase, clientId, 'enquiry_received', enquiryOf(email), actorAccountId);
	return { clientId, personId, filedEmailId: filing.id };
}

function enquiryOf(email: EmailDetails): Record<string, string> {
	return { channel: emailChannel, subject: email.subject, from: email.from };
}

function clientSeedOf(lead: NewLead, broughtInBy: StaffMember): NewClientSeed {
	const profile = { ...emptyCompanyProfile, companyNumber: lead.companyNumber };
	return { name: lead.leadName, website: noWebsite, ownerId: broughtInBy.id, profile };
}

async function listSender(supabase: SupabaseClient, clientId: string, lead: NewLead, senderAddress: string, actorAccountId: string): Promise<string> {
	const email = senderAddress.toLowerCase();
	const contact = { name: lead.senderName, email, phone: lead.senderPhone, role: noRole, isPrimary: true };
	await addClientContact(supabase, clientId, contact, actorAccountId);
	const personId = await findPersonByEmail(supabase, email);
	if (personId === null) throw new Error('The sender was listed at the new lead, yet no person holds their address.');
	return personId;
}
