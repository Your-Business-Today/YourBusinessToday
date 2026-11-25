import type { LegalSection } from '$lib/data/legalDocument';

export const termsDataSections: LegalSection[] = [
	{
		heading: 'Your data',
		paragraphs: [
			'You own your data. When you put personal data into the portal, your business is the controller and we process it for you. Every business we work with agrees data processing terms with us, in its written agreement, before it puts personal data into the portal; they say what we may do with it, how we keep it safe and what happens to it at the end. Our privacy statement explains how we use the personal data of the people who hold accounts.',
			'You give us permission to store, copy and process what you put into the portal, only as far as we need to run it for you. We never use it for our own purposes, never combine it with another client’s data, and never use it to train an AI model.',
			'We run the portal with Supabase and Vercel in London, send its emails through Resend, and our people work with Anthropic’s Claude. The full list of the services that may handle your data, and where each holds it, is in your data processing terms.',
			'The portal does not make a decision about a person that has a legal or similarly significant effect on them, such as a right-to-work check, without a person checking it.',
			'We back up the portal, but keep your own copy of anything you cannot afford to lose. A manager of your business can export its data at any time.'
		]
	}
];
