import { renderInviteEmail } from './inviteEmailShell';

export const confirmAccountEmailSubject = 'Confirm your Your Business Today account';

const heading = 'Confirm your email address';
const body =
	'Open this link to confirm the address and you will be signed in with the password you chose. ' +
	'If you did not create an account, you can ignore this email.';
const buttonLabel = 'Confirm and sign in';

export function renderConfirmAccountEmail(confirmUrl: string): string {
	return renderInviteEmail(heading, body, confirmUrl, buttonLabel);
}
