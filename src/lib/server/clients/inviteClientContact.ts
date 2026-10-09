import {
	clientInviteEmailSubject,
	renderClientInviteEmail
} from '$lib/server/email/clientInviteEmail';
import { countContactInvitesThisHour } from './recentContactInviteCount';
import { isInviteAllowanceSpent } from '$lib/server/email/inviteAllowance';
import { recordClientEvent } from './recordClientEvent';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { mintSignInLink } from '$lib/server/accounts/mintSignInLink';
import type { ClientContact } from './clientContactRecord';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { SupabaseClient } from '@supabase/supabase-js';

export type InviteOutcome = 'already_invited' | 'too_many_invites' | EmailDelivery;

export const inviteOutcomes = {
	alreadyInvited: 'already_invited',
	tooManyInvites: 'too_many_invites'
} as const;

export async function inviteClientContact(
	supabase: SupabaseClient,
	contact: ClientContact,
	origin: string,
	actorAccountId: string
): Promise<InviteOutcome> {
	if (contact.accountId !== null) return 'already_invited';
	const invitesThisHour = await countContactInvitesThisHour(supabase, actorAccountId);
	if (isInviteAllowanceSpent(invitesThisHour)) return 'too_many_invites';
	const invitation = await mintSignInLink(contact.email, origin);
	await linkContactToAccount(supabase, contact.id, invitation.accountId);
	const delivery = await deliverInvitation(contact, invitation.actionLink);
	await recordClientEvent(
		supabase,
		contact.clientId,
		'contact_invited',
		{ email: contact.email },
		actorAccountId
	);
	return delivery;
}

async function linkContactToAccount(
	supabase: SupabaseClient,
	contactId: string,
	accountId: string
): Promise<void> {
	const { error } = await supabase
		.from('client_contacts')
		.update({ account_id: accountId, invited_at: new Date().toISOString() })
		.eq('id', contactId);
	if (error) throw error;
}

/**
 * The account exists once the link is minted; an undelivered email must not
 * undo it, so the delivery status travels back for staff to see.
 */
function deliverInvitation(contact: ClientContact, setPasswordUrl: string): Promise<EmailDelivery> {
	return sendTransactionalEmail({
		to: contact.email,
		subject: clientInviteEmailSubject('Your Business Today'),
		html: renderClientInviteEmail(contact.name, setPasswordUrl)
	});
}
