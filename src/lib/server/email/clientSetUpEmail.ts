import { arrivalButtonLabel, renderInviteEmail } from './inviteEmailShell';
import { onePrompt } from '$lib/onboarding/onboarding';
import { escapeHtml } from '$lib/data/escapeHtml';

export type SetUpEmail = {
	personName: string;
	organisationName: string;
	openUrl: string;
	isNewAccount: boolean;
};

export function clientSetUpEmailSubject(organisationName: string): string {
	return `${organisationName} is set up on Your Business Today`;
}

/** The one email each of a client's first people gets: who set them up, the one link that brings them in, and the one prompt. */
export function renderClientSetUpEmail(email: SetUpEmail): string {
	const body =
		`We have set ${email.organisationName} up on Your Business Today, with you on it. ` +
		`${arrivalStep(email.isNewAccount)} Your company’s page on the portal is waiting, with the ` +
		'steps to connect your own Claude.';
	return renderInviteEmail(
		`Hello ${email.personName}`,
		body,
		email.openUrl,
		arrivalButtonLabel(email.isNewAccount, 'Open your company'),
		promptHtml()
	);
}

function arrivalStep(isNewAccount: boolean): string {
	if (isNewAccount) return 'Follow the link and choose a password.';
	return 'Follow the link and sign in with the account you already have.';
}

function promptHtml(): string {
	return `<p style="margin:24px 0 8px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			Once your Claude is connected, paste this one prompt into a new chat. It maps how your business works,
			and you can run it again whenever your business changes.
		</p>
		<pre style="margin:0;padding:16px;white-space:pre-wrap;font-size:13px;line-height:1.5;color:#eef1f8;
			background-color:#0b0e16;border:1px solid #242c40;border-radius:8px;">${escapeHtml(onePrompt)}</pre>`;
}
