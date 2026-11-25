import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { renderContractPackEmail } from '$lib/server/email/contractPackEmail';
import { emailDeliveries, type EmailDelivery } from '$lib/data/emailDelivery';
import { contractPackTable } from './contractPackTables';
import { moveContractPackOn } from './contractPackStages';
import type { PackSendingPlan } from './packSendingPlan';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What the person is told when the email did not go, and the pack stays as it was. */
export const undeliveredPackNotices: Record<Exclude<EmailDelivery, 'sent'>, string> = {
	skipped: 'Nothing was sent: email is not set up on this site, so the pack stays as it was.',
	failed: 'The email could not be sent, so the pack stays as it was. Try again later.'
};

/** Sends the one email the plan showed and, once it has gone, records to whom and when and moves a drafted pack to sent. */
export async function sendContractPack(supabase: SupabaseClient, plan: PackSendingPlan): Promise<EmailDelivery> {
	const { contact, clientName, documents, packUrl, subject } = plan;
	const html = renderContractPackEmail({ contactName: contact.name, clientName, documentTitles: documents.map(({ title }) => title), packUrl });
	const delivery = await sendTransactionalEmail({ to: contact.email, subject, html });
	if (delivery !== emailDeliveries.sent) return delivery;
	await recordPackSent(supabase, plan);
	return delivery;
}

async function recordPackSent(supabase: SupabaseClient, { packId, contact }: PackSendingPlan): Promise<void> {
	const sending = { sent_at: new Date().toISOString(), sent_to: contact.email, sent_to_contact_id: contact.id };
	const { error } = await supabase.from(contractPackTable).update(sending).eq('id', packId);
	if (error !== null) throw error;
	await moveContractPackOn(supabase, packId, 'sent');
}
