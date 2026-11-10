import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const privacySharingSections: LegalSection[] = [
	{
		heading: 'Who processes it for us',
		paragraphs: ['A small number of providers process data on our behalf:'],
		listItems: [
			'Supabase — the database, the sign-in, and the storage where attachments and documents live.',
			'Vercel — hosting of the application.',
			'Anthropic — the Claude assistant our staff work with, as described above.',
			'Resend — sending the service’s emails, such as invitations, enquiry notifications and the tax deadlines email the calculator sends when you ask for it.'
		]
	},
	{
		heading: 'International transfers',
		paragraphs: [
			'Some of those providers process data outside the United Kingdom, principally in the United States. Where they do, the transfer is covered by the United Kingdom’s adequacy regulations or by the International Data Transfer Agreement or Addendum approved by the Information Commissioner, together with the provider’s own commitment to the same standard of protection.'
		]
	},
	{
		heading: 'Who else can see it',
		paragraphs: [
			'Inside your business, the contacts you have named see the projects and requests we run for you. Inside ours, our staff see the client register, and a member of staff sees a project only if they own it or have been put on its team. Nobody outside those two groups sees your work, and we disclose information beyond them only where the law requires it.'
		]
	},
	{
		heading: 'If your business named you as a contact',
		paragraphs: [
			'You may be reading this because somebody else brought you here: your business named you as a contact so that you could use the portal. This part is for you.',
			'We hold your name, email address, phone number and role as your business gave them to us, along with the requests you raise, the messages you write and the files you attach. The other contacts at your business and the staff working on your projects can see them. Where a member of our staff asks their Claude assistant about a thread, it reads that thread as described above.',
			`You have the same rights as anybody else named in this statement. If you would rather not be a contact, tell your business and they can remove you — or write to ${companyDetails.consultingEmail} and we will.`
		]
	}
];
