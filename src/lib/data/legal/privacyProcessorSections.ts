import type { LegalSection } from '$lib/data/legalDocument';

export const privacyProcessorSections: LegalSection[] = [
	{
		heading: 'What we process for your business',
		paragraphs: [
			'Some information we hold is not ours to decide about. For it, the business that is our client is the controller and we are its processor, under the data processing agreement in our contract with that business. We use it only on the business’s instructions, to provide the service, and we keep and delete it as that agreement says. If you want to exercise your rights over it, the business is the one to ask, and we will help it answer. It is:'
		],
		listItems: [
			'Everything a business keeps in the software we build and run for it.',
			'Everything a business keeps in its Books, its Your Business Brain, its Boardroom and its workflow map on yourbusiness.today.',
			'The documents, exports, working material and files a business hands over during an engagement, whether sent to us or attached in the portal, so that we can understand how it runs.',
			'Questions asked through a chatbot — when a business gives you a chatbot onto its Your Business Brain, every question asked through it is recorded for that business: who asked, with the email they signed in with, the question in their words, when it was asked, what was read for it and what came back, and the answer their Claude reports it gave. The business’s managers can read that record, so it can show what was and was not asked.'
		]
	}
];
