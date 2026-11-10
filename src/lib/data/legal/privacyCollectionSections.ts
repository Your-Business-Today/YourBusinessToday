import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const privacyCollectionSections: LegalSection[] = [
	{
		heading: 'Who we are',
		paragraphs: [
			`${companyDetails.legalName}, a company registered in England and Wales under number ${companyDetails.registrationNumber} with its registered office at ${companyDetails.registeredAddress}, is the data controller for the personal information handled by yourbusiness.today and by our consultancy. For anything in this statement, write to ${companyDetails.consultingEmail}.`,
			'The promise, stated once here and meant everywhere: what we learn about your business is used to do your work and nothing else. It is never sold, never pooled with another client’s, never used to train anything for anybody else, and it leaves with you when you go.'
		]
	},
	{
		heading: 'What we hold',
		paragraphs: ['We hold these kinds of information:'],
		listItems: [
			'Account details — the email address we invited, a display name, and the password you set.',
			'Client register records — the businesses we work with or hope to, the people named as contacts, their role and contact details, and the history of our dealings with them.',
			'Enquiries — the name, email address, company, website and message sent through the contact page, which becomes a lead in that register.',
			'Portal content — the projects, goals and tasks we run for your business, the requests your people raise, the messages on each thread, and the files attached to them.',
			'What you give us during an engagement — the documents, exports and working material you hand over so that we can understand how the business runs.',
			'Questions asked through a chatbot — when a business gives you a chatbot onto its Your Business Brain, every question asked through it is recorded for that business: who asked, with the email they signed in with, the question in their words, when it was asked, what was read for it and what came back, and the answer their Claude reports it gave. The business’s managers can read that record, so it can show what was and was not asked.',
			'Activity records — notifications, the API tokens and authorisations you grant, and a log of what changed and who changed it. We take no card payments on this site, so we hold no card details at all.',
			'Technical records — server logs carrying an IP address and browser details, kept briefly for security.'
		]
	},
	{
		heading: 'Why we use it, and the lawful basis',
		paragraphs: [
			'We use it to do the work you have engaged us for and to run the portal around it: signing you in, carrying your requests, keeping the record of a project, and sending the service emails a piece of work needs. The lawful basis for that is performing our contract with you or with your business.',
			'We rely on our legitimate interests to keep the service secure, to reply to enquiries and maintain the client register, and to correspond as any business relationship requires. We rely on legal obligation to keep the records that tax and accounting law demands. Where we need consent for anything else we will ask at the time, and you can withdraw it.',
			'We do not advertise to you, we do not profile you, and we do not sell your information to anybody.'
		]
	},
	{
		heading: 'AI processing',
		paragraphs: [
			'The portal sends nothing to an AI model itself. Our staff work with their own Claude assistant, which reaches the portal through our connector with exactly the access of the member of staff using it: when they ask it to research a business, draft a message or work a request, it reads the records that work needs and Anthropic processes them to produce the answer.'
		]
	}
];
