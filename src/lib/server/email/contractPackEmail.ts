import { escapeHtml } from '$lib/data/escapeHtml';

/** What the contract pack email says: whom it greets, whose pack it is, the documents in it and the link to them. */
export type ContractPackEmail = { contactName: string; clientName: string; documentTitles: string[]; packUrl: string };

export function contractPackEmailSubject(clientName: string): string {
	return `Your contract with Your Business Today, for ${clientName} to sign`;
}

export function renderContractPackEmail(email: ContractPackEmail): string {
	const documents = email.documentTitles.map((title) => `<li>${escapeHtml(title)}</li>`).join('');
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">Hello ${escapeHtml(email.contactName)}</h1>
		<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			${escapeHtml(email.clientName)}'s contract with Your Business Today is ready for you in your client portal.
			Read each document, comment on any clause you want to discuss, and accept and sign each one there.
		</p>
		<ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.6;color:#c9d2e6;">${documents}</ul>
		<a
			href="${email.packUrl}"
			style="display:inline-block;background-color:#ff4d5e;color:#0b0e16;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			Read and sign
		</a>
		<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;">
			If the button doesn't work, open this link: <br />
			<a href="${email.packUrl}" style="color:#c9d2e6;">${email.packUrl}</a>
		</p>
	</div>
</div>`;
}
