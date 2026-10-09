import { addProjectMember } from './addProjectMember';
import { countProjectInvitesThisHour } from './recentProjectInviteCount';
import { findAccountByEmail } from '$lib/server/accounts/findAccountByEmail';
import { isInviteAllowanceSpent } from '$lib/server/email/inviteAllowance';
import { mintSignInLink } from '$lib/server/accounts/mintSignInLink';
import {
	projectInviteEmailSubject,
	renderProjectInviteEmail
} from '$lib/server/email/projectInviteEmail';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { Project } from '$lib/server/projects/projectRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProjectInviteOutcome =
	'already_on_project' | 'is_the_owner' | 'too_many_invites' | EmailDelivery;

export type ProjectInvite = {
	project: Project;
	email: string;
	inviter: Account;
	origin: string;
	memberIds: string[];
};

type Arrival = { accountId: string; openProjectUrl: string; isNewAccount: boolean };

/** The membership is created at once; the email is the doorbell. */
export async function inviteToProject(
	supabase: SupabaseClient,
	invite: ProjectInvite
): Promise<ProjectInviteOutcome> {
	const { project, inviter } = invite;
	const invitesThisHour = await countProjectInvitesThisHour(supabase, inviter.id);
	if (isInviteAllowanceSpent(invitesThisHour)) return 'too_many_invites';
	const existingAccount = await findAccountByEmail(supabase, invite.email);
	if (existingAccount?.id === project.ownerId) return 'is_the_owner';
	if (existingAccount !== null && invite.memberIds.includes(existingAccount.id)) {
		return 'already_on_project';
	}
	const arrival = await arrivalFor(invite, existingAccount);
	await addProjectMember(supabase, project.id, arrival.accountId, inviter.id);
	return deliverInvite(invite, arrival);
}

async function arrivalFor(
	invite: ProjectInvite,
	existingAccount: Account | null
): Promise<Arrival> {
	if (existingAccount !== null) {
		const { project } = invite;
		return {
			accountId: existingAccount.id,
			openProjectUrl: `${invite.origin}/projects/${project.id}`,
			isNewAccount: false
		};
	}
	const signInLink = await mintSignInLink(invite.email, invite.origin);
	return {
		accountId: signInLink.accountId,
		openProjectUrl: signInLink.actionLink,
		isNewAccount: true
	};
}

function deliverInvite(invite: ProjectInvite, arrival: Arrival): Promise<EmailDelivery> {
	const { project, inviter } = invite;
	return sendTransactionalEmail({
		to: invite.email,
		subject: projectInviteEmailSubject(project.name),
		html: renderProjectInviteEmail(
			inviter.name,
			project.name,
			arrival.openProjectUrl,
			arrival.isNewAccount
		)
	});
}
