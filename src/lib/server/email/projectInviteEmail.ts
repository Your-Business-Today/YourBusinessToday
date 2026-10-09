export function projectInviteEmailSubject(projectName: string): string {
	return `You have been added to ${projectName} on Your Business Today`;
}

export function renderProjectInviteEmail(
	inviterName: string,
	projectName: string,
	openProjectUrl: string,
	isNewAccount: boolean
): string {
	const instruction = isNewAccount
		? 'Set a password to get in; the project will be waiting.'
		: 'Sign in with the account you already have and it will be on your projects page.';
	const buttonLabel = isNewAccount ? 'Set your password' : 'Open the project';
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">${inviterName} has added you to ${projectName}</h1>
		<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			You can now see its goals and tasks, work on them, and talk to the team on each one —
			on the site or through your own assistant. ${instruction}
		</p>
		${inviteButtonHtml(openProjectUrl, buttonLabel)}
		${inviteFooterHtml(openProjectUrl)}
	</div>
</div>`;
}

function inviteButtonHtml(openProjectUrl: string, buttonLabel: string): string {
	return `<a
			href="${openProjectUrl}"
			style="display:inline-block;background-color:#ff4d5e;color:#0b0e16;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			${buttonLabel}
		</a>`;
}

function inviteFooterHtml(openProjectUrl: string): string {
	return `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;">
			If the button doesn't work, open this link: <br />
			<a href="${openProjectUrl}" style="color:#c9d2e6;">${openProjectUrl}</a>
		</p>`;
}
