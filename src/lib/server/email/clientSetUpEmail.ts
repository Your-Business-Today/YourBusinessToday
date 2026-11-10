import { arrivalButtonLabel, renderInviteEmail } from './inviteEmailShell';

export type SetUpEmail = {
	personName: string;
	organisationName: string;
	openUrl: string;
	isNewAccount: boolean;
};

export function clientSetUpEmailSubject(organisationName: string): string {
	return `${organisationName} is set up on Your Business Today`;
}

/** The one email each of a client's first people gets: who set them up, and the one link that brings them in. */
export function renderClientSetUpEmail(email: SetUpEmail): string {
	const body =
		`We have set ${email.organisationName} up on Your Business Today, with you on it. ` +
		`${arrivalStep(email.isNewAccount)} Your company’s page on the portal is waiting, with the ` +
		'steps to connect your own Claude and the one prompt that starts mapping how your business works.';
	return renderInviteEmail(
		`Hello ${email.personName}`,
		body,
		email.openUrl,
		arrivalButtonLabel(email.isNewAccount, 'Open your company')
	);
}

function arrivalStep(isNewAccount: boolean): string {
	if (isNewAccount) return 'Follow the link and choose a password.';
	return 'Follow the link and sign in with the account you already have.';
}
