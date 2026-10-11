import { addOrganisationMember } from './addOrganisationMember';
import { countOrganisationInvitesThisHour } from './recentOrganisationInviteCount';
import { findAccountByEmail } from '$lib/server/accounts/findAccountByEmail';
import { isInviteAllowanceSpent } from '$lib/server/email/inviteAllowance';
import { mintSignInLink } from '$lib/server/accounts/mintSignInLink';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import {
	organisationInviteEmailSubject,
	renderOrganisationInviteEmail
} from '$lib/server/email/organisationInviteEmail';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { Organisation } from './organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OrganisationInviteOutcome = 'already_on_organisation' | 'too_many_invites' | EmailDelivery;

export type OrganisationInvite = {
	organisation: Organisation;
	email: string;
	isManager: boolean;
	inviter: Account;
	origin: string;
	memberIds: string[];
};

type Arrival = { accountId: string; openUrl: string; isNewAccount: boolean };

/**
 * The membership — and every project it grants — is created at once; the email is the doorbell.
 * The account directory answers staff and the service role only, and a project manager need not be
 * staff, so the address is looked up as the service role.
 */
export async function inviteToOrganisation(
	supabase: SupabaseClient,
	invite: OrganisationInvite
): Promise<OrganisationInviteOutcome> {
	const { organisation, inviter } = invite;
	const invitesThisHour = await countOrganisationInvitesThisHour(supabase, inviter.id);
	if (isInviteAllowanceSpent(invitesThisHour)) return 'too_many_invites';
	const existingAccount = await findAccountByEmail(supabaseServiceClient(), invite.email);
	if (existingAccount !== null && invite.memberIds.includes(existingAccount.id)) {
		return 'already_on_organisation';
	}
	const arrival = await arrivalFor(invite, existingAccount);
	await addOrganisationMember(supabase, {
		organisationId: organisation.id,
		accountId: arrival.accountId,
		isManager: invite.isManager,
		addedBy: inviter.id
	});
	return deliverInvite(invite, arrival);
}

async function arrivalFor(invite: OrganisationInvite, existingAccount: Account | null): Promise<Arrival> {
	const { organisation } = invite;
	if (existingAccount !== null) {
		return {
			accountId: existingAccount.id,
			openUrl: `${invite.origin}/organisations/${organisation.id}`,
			isNewAccount: false
		};
	}
	const signInLink = await mintSignInLink(invite.email, invite.origin);
	return { accountId: signInLink.accountId, openUrl: signInLink.actionLink, isNewAccount: true };
}

function deliverInvite(invite: OrganisationInvite, arrival: Arrival): Promise<EmailDelivery> {
	const { organisation, inviter } = invite;
	return sendTransactionalEmail({
		to: invite.email,
		subject: organisationInviteEmailSubject(organisation.name),
		html: renderOrganisationInviteEmail(inviter.name, organisation.name, arrival.openUrl, arrival.isNewAccount)
	});
}
