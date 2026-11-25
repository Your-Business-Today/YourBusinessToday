import type { LegalSection } from '$lib/data/legalDocument';
import { termsDataSections } from './termsDataSections';
import { termsOwnershipSections } from './termsOwnershipSections';

export const termsEngagementSections: LegalSection[] = [
	{
		heading: 'The client portal',
		paragraphs: [
			'If we work for your business, we open the portal to the people you name. There they can see the projects we run for you, the goals and tasks inside them, and every request they have raised. A request is raised in plain English, discussed on its own thread, and becomes work only when we accept it. What that acceptance commits us to is set by your written agreement.',
			'You can attach files to a request when they are part of the ask. Attach only what the work needs, and nothing you are not entitled to share with us.'
		]
	},
	...termsOwnershipSections,
	...termsDataSections,
	{
		heading: 'Confidentiality',
		paragraphs: [
			'What we learn about your business during an engagement is confidential. We do not disclose it outside the people working on it, and we will not name you as a client, publish a case study, or describe the work publicly without your agreement in writing. The same obligation runs the other way for what we show you about how we work.'
		]
	},
	{
		heading: 'Connecting your own tools',
		paragraphs: [
			'You can connect Claude, or another tool that speaks the same protocol, to your portal — either with a token you mint in your account or by authorising an application. That connection can do what you can do, so a token is a secret: keep it safe, mint one per tool, and revoke anything you no longer use.',
			'You are responsible for what a connected tool does with your access, and for reading what an application asks for before you authorise it. We may revoke a token or an authorisation that is being misused.',
			'Other services you connect, such as Xero or Microsoft 365, are your suppliers, under their own terms. We are not responsible for their outages or changes.'
		]
	},
	{
		heading: 'Chatbots onto Your Business Brain',
		paragraphs: [
			'A business can give people a chatbot onto part of its Your Business Brain, which they read through their own Claude. Every question asked through a chatbot is recorded for the business that runs it: who asked and when, the question in their words, what was read for it and what came back, and the answer their Claude reports it gave. The business’s managers can read the record.',
			'The record is kept for as long as the business keeps its Your Business Brain, or any shorter period it sets. Only the business can delete entries, and each deletion is itself recorded. The business explains how it uses the record in its own privacy notice. If you use a chatbot, your questions are recorded in this way, and the sections of these terms on checking what is generated, AI-generated output and acceptable use apply to you.'
		]
	},
	{
		heading: 'AI-generated output',
		paragraphs: [
			'The portal itself sends nothing to an AI model. What Claude, or another AI tool you connect, produces through the connector is AI output: summaries, drafts and replies to what you ask it. As the section on software says, none of it is professional advice, and it can be incomplete, out of date or wrong: check anything important before you act on it.'
		]
	}
];
