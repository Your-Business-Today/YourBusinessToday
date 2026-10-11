import { tooManyInvitesMessage } from '$lib/server/email/inviteAllowance';
import { undeliveredInviteNotice, type EmailDelivery } from '$lib/data/emailDelivery';
import type { OrganisationInviteOutcome } from '$lib/server/organisations/inviteToOrganisation';
import type { ProjectInviteOutcome } from './inviteToProject';

export type InviteOutcomeMessage = { isRefusal: boolean; message: string };

const projectRefusals: Record<string, string> = {
	is_the_owner: 'That is the owner — they are already on the project.',
	already_on_project: 'They are already on this project.',
	too_many_invites: tooManyInvitesMessage
};

const organisationRefusals: Record<string, string> = {
	already_on_organisation: 'They are already on this organisation.',
	too_many_invites: tooManyInvitesMessage
};

export function inviteOutcomeMessage(outcome: ProjectInviteOutcome, email: string): InviteOutcomeMessage {
	return describeInviteOutcome(outcome, email, projectRefusals, 'the project');
}

export function organisationInviteOutcomeMessage(
	outcome: OrganisationInviteOutcome,
	email: string
): InviteOutcomeMessage {
	return describeInviteOutcome(outcome, email, organisationRefusals, 'the organisation');
}

function describeInviteOutcome(
	outcome: string,
	email: string,
	refusals: Record<string, string>,
	place: string
): InviteOutcomeMessage {
	const refusal = refusals[outcome];
	if (refusal !== undefined) return { isRefusal: true, message: refusal };
	const undelivered = undeliveredInviteNotice(outcome as EmailDelivery);
	if (undelivered !== null) return { isRefusal: false, message: `${email} is on ${place}. ${undelivered}` };
	return { isRefusal: false, message: `${email} is on ${place} and has been emailed.` };
}
