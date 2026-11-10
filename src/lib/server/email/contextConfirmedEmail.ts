import { escapeHtml } from '$lib/data/escapeHtml';
import { renderInviteEmail } from './inviteEmailShell';

/** Which client confirmed which version, and where staff open it. */
export type ConfirmedContext = { organisationName: string; versionNumber: number; contextUrl: string };

export function contextConfirmedSubject({ organisationName }: ConfirmedContext): string {
	return `${organisationName} confirmed their company context`;
}

/** Tells staff a client has confirmed their context, so the services can be raised from it as goals. */
export function renderContextConfirmedEmail(confirmed: ConfirmedContext): string {
	const organisationName = escapeHtml(confirmed.organisationName);
	const heading = `${organisationName} confirmed their company context`;
	const body =
		`They confirmed version ${confirmed.versionNumber} on their portal as right. Next, a staff member's Claude ` +
		'raises the services their business needs from it as goals on their project, where they follow them.';
	return renderInviteEmail(heading, body, confirmed.contextUrl, 'Open their company context');
}
