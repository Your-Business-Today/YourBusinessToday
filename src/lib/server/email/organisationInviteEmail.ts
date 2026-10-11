import { arrivalButtonLabel, arrivalInstruction, renderInviteEmail } from './inviteEmailShell';

export function organisationInviteEmailSubject(organisationName: string): string {
	return `You have been added to ${organisationName} on Your Business Today`;
}

export function renderOrganisationInviteEmail(
	inviterName: string,
	organisationName: string,
	openOrganisationUrl: string,
	isNewAccount: boolean
): string {
	const body =
		`You are now on every project ${organisationName} has with Your Business Today, and on each ` +
		'new one as it starts: its goals, its tasks and the conversation on each — on the site or ' +
		`through your own assistant. ${arrivalInstruction(isNewAccount, 'the organisation')}`;
	return renderInviteEmail(
		`${inviterName} has added you to ${organisationName}`,
		body,
		openOrganisationUrl,
		arrivalButtonLabel(isNewAccount, 'Open the organisation')
	);
}
