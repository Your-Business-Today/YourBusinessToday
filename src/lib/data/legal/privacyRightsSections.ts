import type { LegalSection } from '$lib/data/legalDocument';

export const privacyRightsSections: LegalSection[] = [
	{
		heading: 'How long we keep it',
		paragraphs: [
			'We keep an account while it is in use, and close it when the person it belongs to leaves or the engagement ends. The record of our work for a business — its projects, tasks, requests and the messages on them, with the order forms and invoices — is kept for the life of the engagement and for six years afterwards, because that is how long a question about the work can reasonably arrive.',
			'What we process for a business is kept as that business decides and deleted as our agreement with it says: when the engagement ends, the business gets a full export, and we delete the data within 30 days of delivering it, with backups expiring after that. The files a business attached in the portal go with it, even where the message they were attached to stays in the record of our work.',
			'Enquiries and client register records are kept while we are working with, or still hoping to work with, the business concerned, and are reviewed at least every two years. The records that tax and accounting law requires are kept for six years and no longer. Server logs are kept for no more than thirty days.',
			'The email address and figures given for a tax deadlines email are not kept: they are used to send that one email and dropped. Resend keeps its own record of the emails it sends, and if a send fails our server logs note the address, for no more than thirty days like every server log.',
			'The record of questions asked through a chatbot is kept for as long as the business keeps its Your Business Brain, and is deleted with the rest of its data when the engagement ends. Until then nothing in the portal changes or deletes it, not even for the business’s own managers, because its whole purpose is to show afterwards exactly what was asked and answered.'
		]
	},
	{
		heading: 'Your rights',
		paragraphs: [
			'Under United Kingdom data protection law you can ask us for a copy of your information, ask us to correct it, delete it or restrict how we use it, object to our use of it, and receive it in a portable form. Write to us and we will answer within a month.',
			'If you are unhappy with how we have handled your information you can complain to the Information Commissioner’s Office at ico.org.uk, though we would rather you told us first so that we can put it right.'
		]
	},
	{
		heading: 'Cookies',
		paragraphs: [
			'We use only the session cookies that keep you signed in and the portal working. They are strictly necessary, which is why no banner asks you to accept them, and there are no advertising or third-party tracking cookies on this site.'
		]
	},
	{
		heading: 'Changes to this statement',
		paragraphs: [
			'If the way we handle information changes, this statement changes with it and the date at the top tells you when. Anything material will be flagged on the site or by email.'
		]
	}
];
