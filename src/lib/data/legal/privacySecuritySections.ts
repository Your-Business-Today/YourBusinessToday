import type { LegalSection } from '$lib/data/legalDocument';

export const privacySecuritySections: LegalSection[] = [
	{
		heading: 'How we keep it safe',
		paragraphs: ['We protect what we hold in these ways:'],
		listItems: [
			'Encrypted on the way. The site and the portal are served only over HTTPS, and the connections between our services and our providers are encrypted too.',
			'Encrypted where it is kept. The database and the stored files are encrypted at rest, and they and the application run in London.',
			'Nobody gets in without signing in, with Google, Microsoft or an email and password. Passwords are kept by the sign-in service in hashed form, never readable by us, and the tokens you grant to connect Claude are kept only as one-way hashes.',
			'Access is checked before anything is read. Every table in the database has row-level security switched on, and the portal and the connector check what a person may see before they read a record, so a person sees only what their role and their projects allow, whichever way they come in.',
			'Our staff see a client’s work only on the projects they own or are on the team of, and their Claude assistant has no more access than they do.',
			'Changes are recorded with who made them, and the record of questions asked through a chatbot cannot be changed or deleted.',
			'The database is backed up every day.',
			'Card details never reach us: they are taken and held by Stripe.'
		]
	},
	{
		heading: 'If something goes wrong',
		paragraphs: [
			'If personal information we hold is lost, exposed or reached by someone who should not have it, we contain it, find out what happened, and tell the Information Commissioner within 72 hours where the law requires it. Where it puts you at risk, we tell you directly and without delay, with what happened and what you can do.'
		]
	}
];
