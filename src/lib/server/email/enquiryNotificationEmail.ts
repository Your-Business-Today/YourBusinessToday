import { escapeHtml } from '$lib/data/escapeHtml';
import type { WebsiteEnquiry } from '$lib/data/enquiryForm';

export function enquiryNotificationSubject(enquiry: WebsiteEnquiry): string {
	const sender = enquiry.company === '' ? enquiry.name : `${enquiry.name} at ${enquiry.company}`;
	return `Website enquiry from ${sender}`;
}

export function renderEnquiryNotificationEmail(enquiry: WebsiteEnquiry, clientUrl: string): string {
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">New enquiry from the website</h1>
		<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			<strong style="color:#eef1f8;">${escapeHtml(enquiry.name)}</strong>
			${enquiry.company === '' ? '' : `at <strong style="color:#eef1f8;">${escapeHtml(enquiry.company)}</strong>`}
			— <a href="mailto:${escapeHtml(enquiry.email)}" style="color:#c9d2e6;">${escapeHtml(enquiry.email)}</a>
		</p>
		${enquiry.website === '' ? '' : websiteLine(enquiry.website)}
		<p style="margin:16px 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#6c7694;">
			What they would like to automate
		</p>
		<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#eef1f8;white-space:pre-wrap;">${escapeHtml(enquiry.message)}</p>
		<a
			href="${clientUrl}"
			style="display:inline-block;background-color:#ff4d5e;color:#0b0e16;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			Open the lead
		</a>
	</div>
</div>`;
}

function websiteLine(website: string): string {
	return `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c9d2e6;">${escapeHtml(website)}</p>`;
}
