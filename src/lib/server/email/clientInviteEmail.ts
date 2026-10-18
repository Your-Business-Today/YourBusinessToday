export function clientInviteEmailSubject(clientName: string): string {
	return `Your ${clientName} account on Your Business Today`;
}

export function renderClientInviteEmail(
	contactName: string,
	setPasswordUrl: string,
	portalAddress: string
): string {
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">Hello ${contactName}</h1>
		<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			We have opened an account for you so you can see the projects we run for you and ask
			for changes without writing an email. Set a password to get in.
		</p>
		<a
			href="${setPasswordUrl}"
			style="display:inline-block;background-color:#ff4d5e;color:#0b0e16;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			Set your password
		</a>
		${portalDoorParagraph(portalAddress)}
		${fallbackLinkParagraph(setPasswordUrl)}
	</div>
</div>`;
}

function portalDoorParagraph(portalAddress: string): string {
	const portalUrl = new URL(portalAddress);
	const shownAddress = `${portalUrl.host}${portalUrl.pathname}`;
	return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#c9d2e6;">
			After that, your door in is
			<a href="${portalAddress}" style="color:#eef1f8;">${shownAddress}</a>.
		</p>`;
}

function fallbackLinkParagraph(setPasswordUrl: string): string {
	return `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;">
			If the button doesn't work, open this link: <br />
			<a href="${setPasswordUrl}" style="color:#c9d2e6;">${setPasswordUrl}</a>
		</p>`;
}
