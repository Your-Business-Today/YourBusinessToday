import { undeliveredInviteNotice } from '$lib/data/emailDelivery';
import type { ClientSetUp } from './setClientUp';
import type { SetUpInvitation } from './inviteSetUpPerson';

/** What the set-up did, in a sentence or two: the organisation, and who was sent their link. */
export function describeClientSetUp(setUp: ClientSetUp): string {
	const lines = setUp.invitations.map(describeInvitation);
	return [`${setUp.organisationName} is set up, with its Onboarding project.`, ...lines].join(' ');
}

function describeInvitation(invitation: SetUpInvitation): string {
	const undelivered = undeliveredInviteNotice(invitation.delivery);
	if (undelivered === null) return `${invitation.name}’s link went to ${invitation.email}.`;
	return `${invitation.name} (${invitation.email}): ${undelivered}`;
}
