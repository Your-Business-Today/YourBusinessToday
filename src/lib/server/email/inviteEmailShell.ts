/** The frame every invitation email shares: the wordmark, the one button, and the link spelled out beneath it. */
export function renderInviteEmail(heading: string, body: string, openUrl: string, buttonLabel: string): string {
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">${heading}</h1>
		<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			${body}
		</p>
		${inviteButtonHtml(openUrl, buttonLabel)}
		${inviteFooterHtml(openUrl)}
	</div>
</div>`;
}

/** What the invited person does next: a newcomer sets a password; someone with an account signs in. */
export function arrivalInstruction(isNewAccount: boolean, whatIsWaiting: string): string {
	if (isNewAccount) return `Set a password to get in; ${whatIsWaiting} will be waiting.`;
	return `Sign in with the account you already have and ${whatIsWaiting} will be on your projects page.`;
}

export function arrivalButtonLabel(isNewAccount: boolean, openLabel: string): string {
	return isNewAccount ? 'Set your password' : openLabel;
}

function inviteButtonHtml(openUrl: string, buttonLabel: string): string {
	return `<a
			href="${openUrl}"
			style="display:inline-block;background-color:#ff4d5e;color:#0b0e16;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			${buttonLabel}
		</a>`;
}

function inviteFooterHtml(openUrl: string): string {
	return `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;">
			If the button doesn't work, open this link: <br />
			<a href="${openUrl}" style="color:#c9d2e6;">${openUrl}</a>
		</p>`;
}
