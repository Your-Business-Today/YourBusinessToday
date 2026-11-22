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
			'give access to your business’s portal to anybody outside the people you have named to us.'
		]
	},
	{
		heading: 'Ending access',
		paragraphs: [
			'An engagement ends on the terms of your written agreement. When it does, we close the portal accounts we opened for your business after the handover period that agreement provides for, and you keep what you have taken a copy of.',
			'We can suspend or close an account that breaks these terms. Where it is reasonable to do so, we will say so first and give you the chance to put it right. Records we have to keep by law are kept for as long as the law requires.'
		]
	},
	{
		heading: 'Our liability',
		paragraphs: [
			'Nothing in these terms excludes liability that cannot be excluded under the law of England and Wales, including liability for death or personal injury caused by negligence, or for fraud.',
			'Beyond that, liability for the consultancy work itself is governed by your written agreement. For the portal and this website, our liability to you is limited to the fees you paid us in the twelve months before the event giving rise to the claim, and we are not liable for loss of profit, loss of business, or loss caused by relying on anything generated on the site, by you or by AI, without checking it.'
		]
	},
	{
		heading: 'Changes to these terms',
		paragraphs: [
			'We may update these terms as the way we work changes. If a change is material we will tell the people whose accounts it affects before it takes effect, and each new version is accepted on the site before the site can be used again, as the section on accepting these terms says.'
		]
	},
	{
		heading: 'Governing law',
		paragraphs: [
			'These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction over any dispute arising from them.'
		]
	}
];
