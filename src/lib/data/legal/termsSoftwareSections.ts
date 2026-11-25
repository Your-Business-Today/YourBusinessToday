import type { LegalSection } from '$lib/data/legalDocument';
import { termsAddresses } from '$lib/data/termsVersion';

export const termsSoftwareSections: LegalSection[] = [
	{
		heading: 'Software, not professional advice',
		paragraphs: [
			'Your Business Today is software. Everything generated on the site — a set of accounts, a bookkeeping entry, a payroll figure, an invoice, a tax estimate, a report, a document, a draft, a summary or a reply — is produced by the software from what you put in. That is so whether you made it on the site yourself or had Claude, or another AI tool, make it through the connector.',
			'We do not provide accountancy, bookkeeping, payroll, audit, tax, legal or financial advice through the site, and nothing generated on it is professional advice from us. We do not keep your books, prepare your accounts, run your payroll or file anything on your behalf: you do those things, using the software. Where you need professional advice, engage a suitably qualified professional, who may use what the software produces as you and they see fit.'
		]
	},
	{
		heading: 'You check what is generated',
		paragraphs: [
			'You are responsible for checking everything generated on the site before you rely on it, send it, file it or act on it — above all anything with legal, tax or financial consequences, such as accounts, VAT figures, payroll and invoices.',
			'When Claude works on the site for you, it follows the written instructions we publish for each thing it can do: what that thing does, and how it is to go about it. These are the skills, and they shape what is generated. Every skill is published in full and you can read it at any time.',
			'If a skill does not suit the way your business works, or you think one is wrong, tell us, or have your Claude tell us through the connector.'
		],
		links: [{ label: 'Read the skills', href: termsAddresses.skills }]
	},
	{
		heading: 'Accepting these terms',
		paragraphs: [
			'You must accept these terms before you use the site. Each version is named by the date it was published. When we publish a new version, you are asked to accept it the next time you visit, and you cannot carry on using the site until you do. We keep a record of which version each account accepted and when.'
		]
	}
];
