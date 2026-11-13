import { companyDetails } from '$lib/data/companyDetails';
import type { LegalSection } from '$lib/data/legalDocument';

export const termsAccountSections: LegalSection[] = [
	{
		heading: 'Who we are',
		paragraphs: [
			`Your Business Today is operated by ${companyDetails.legalName}, a company registered in England and Wales under number ${companyDetails.registrationNumber}, with its registered office at ${companyDetails.registeredAddress} (“we”, “us”). You can reach us at ${companyDetails.consultingEmail}.`,
			'We are a consultancy. These terms cover this website and the client portal we run on it. The consultancy work itself — what we do for your business, over what period, for what fee — is governed by the written agreement we sign with you, and these terms sit underneath it.'
		]
	},
	{
		heading: 'Who this is for',
		paragraphs: [
			'This is not a product anybody can sign up to. There is no public registration. Accounts exist for the businesses we work with, for the people those businesses name as contacts, and for our own staff. We create each one, and the person we create it for is invited by email to set a password.',
			'If you are using the portal on behalf of a business, you confirm you have that business’s authority to do so. Using an account we have given you means you accept these terms.'
		]
	},
	{
		heading: 'Your written agreement comes first',
		paragraphs: [
			'Every engagement is set out in writing before it starts: the scope, what we deliver, the fees, the notice either side gives. If anything in these terms disagrees with your written agreement, your written agreement wins for that engagement.',
			'An enquiry sent through the contact page is not a contract, and neither is a conversation about what we might do. It records you in our client register so that we can reply, and nothing more.'
		]
	},
	{
		heading: 'Fees',
		paragraphs: [
			'Fees are the ones named in your written agreement and are invoiced under it. You can pay an invoice by card from the Billing section of the portal: the payment is taken by Stripe, and we never see or hold your card details. This site sells nothing directly, and nothing you do in the portal commits you to a cost that the agreement has not already set out.'
		]
	},
	{
		heading: 'Your account',
		paragraphs: [
			'Your account is yours alone. Keep your password to yourself, and tell us promptly if you think somebody else has used it. You are responsible for what happens under your account, you must be at least 18, and the details you give us must be accurate.',
			'Tell us when somebody at your business should no longer have access. We will close their account, but until you tell us we have no way of knowing they have left.'
		]
	}
];
