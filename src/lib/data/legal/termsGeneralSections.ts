import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const termsGeneralSections: LegalSection[] = [
	{
		heading: 'Acceptable use',
		paragraphs: ['When using the portal you must not:'],
		listItems: [
			'upload anything unlawful, or anything that infringes somebody else’s rights;',
			'attempt to disrupt, overload, probe or gain unauthorised access to the service;',
			'use it to generate unlawful or harmful material;',
			'pass a token or an authorisation to somebody who should not have your access;',
			'give access to your business’s portal to anybody outside the people you have named to us, other than through a chatbot you have set up.'
		]
	},
	{
		heading: 'Availability and changes',
		paragraphs: [
			'We aim to keep the portal available and working, but we do not promise it will be uninterrupted or free of errors. We may change, improve or remove features. If your written agreement relies on a feature, it says what happens; otherwise we will tell you before we remove one you use.'
		]
	},
	{
		heading: 'Ending access',
		paragraphs: [
			'An engagement ends on the terms of your written agreement. When it does, we close the portal accounts we opened for your business after the handover period that agreement provides for. During the handover period we give the business, or its insolvency practitioner if it has closed, a copy of its data on request, then close its accounts and delete its data as its data processing terms say.',
			'We can suspend or close an account that breaks these terms. Where it is reasonable to do so, we will say so first and give you the chance to put it right. Records we have to keep by law are kept for as long as the law requires.'
		]
	},
	{
		heading: 'Our liability',
		paragraphs: [
			'Nothing in these terms excludes liability that cannot be excluded under the law of England and Wales, including liability for death or personal injury caused by negligence, or for fraud.',
			'Beyond that, liability for the consultancy work itself is governed by your written agreement. For the portal and this website, our liability to you is limited to the greater of £5,000 and the fees you paid us in the twelve months before the event giving rise to the claim, unless your written agreement sets a different limit, and we are not liable for loss of profit, loss of business, or loss caused by relying on anything generated on the site, by you or by AI, without checking it.'
		]
	},
	{
		heading: 'Events outside our control',
		paragraphs: [
			'We are not liable for a delay or failure caused by events beyond our reasonable control, as long as we tell you promptly and do what we reasonably can to limit the effect.'
		]
	},
	{
		heading: 'Changes to these terms',
		paragraphs: [
			'We may update these terms as the way we work changes. If a change is material we will tell the people whose accounts it affects before it takes effect, and each new version is accepted on the site before the site can be used again, as the section on accepting these terms says.'
		]
	},
	{
		heading: 'General',
		paragraphs: [],
		listItems: [
			'If a court finds part of these terms unenforceable, the rest still applies.',
			'If we do not enforce a right straight away, we have not given it up.',
			'We may transfer these terms to a company that takes over our business. You may not transfer them without our written agreement.',
			'Nobody other than you and us can enforce these terms under the Contracts (Rights of Third Parties) Act 1999.',
			`We send notices by email to the address on your account. Send yours to ${companyDetails.consultingEmail}.`
		]
	},
	{
		heading: 'Governing law',
		paragraphs: [
			'These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction over any dispute arising from them.'
		]
	}
];
