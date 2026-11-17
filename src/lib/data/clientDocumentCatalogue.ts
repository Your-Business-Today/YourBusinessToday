import { internalDocumentEntries } from './internalDocumentEntries';

export type ClientDocumentAudience = 'client' | 'internal';

export type ClientDocumentEntry = {
	slug: string;
	title: string;
	summary: string;
	audience: ClientDocumentAudience;
};

export const clientDocumentCatalogue: ClientDocumentEntry[] = [
	{
		slug: 'master-services-agreement',
		title: 'Master Services Agreement',
		summary:
			'Signed once per client. Stages, acceptance, change control, payment and suspension, the managed Solution, IP assignment, liability caps, insurance and governing law.',
		audience: 'client'
	},
	{
		slug: 'order-form',
		title: 'Order Form',
		summary:
			'One per Discovery stage, Build stage or Run service: scope, acceptance criteria, dates and fees. Incorporates the MSA by reference.',
		audience: 'client'
	},
	{
		slug: 'data-processing-agreement',
		title: 'Schedule 1 — Data Processing Agreement',
		summary:
			'The Article 28 processor terms, the processing details, the security measures and the sub-processor register.',
		audience: 'client'
	},
	{
		slug: 'service-level-agreement',
		title: 'Schedule 2 — Service Levels and Support',
		summary:
			'99.5% availability, support hours, response targets by priority, backup and recovery targets, service credits and exclusions.',
		audience: 'client'
	},
	{
		slug: 'acceptable-use-policy',
		title: 'Schedule 3 — Acceptable Use Policy',
		summary: 'What the client’s users may and may not do with the Solution and the portal.',
		audience: 'client'
	},
	{
		slug: 'exit-and-continuity',
		title: 'Schedule 4 — Exit and Continuity',
		summary:
			'Self-service export at any time and for 30 days after the Run service ends, data return and deletion, hand-over of the Azure subscription and what the client needs to take it, a monthly continuity copy, and step-in if YBT cannot continue.',
		audience: 'client'
	},
	...internalDocumentEntries
];

export function findClientDocumentEntry(slug: string): ClientDocumentEntry | undefined {
	return clientDocumentCatalogue.find((entry) => entry.slug === slug);
}

export function clientDocumentsFor(audience: ClientDocumentAudience): ClientDocumentEntry[] {
	return clientDocumentCatalogue.filter((entry) => entry.audience === audience);
}

const everySlug = clientDocumentCatalogue.map((entry) => entry.slug).join(', ');

export const noSuchClientDocument = `There is no document with that slug. The documents are: ${everySlug}.`;

export function validateClientDocumentSlug(slug: string): string | null {
	if (findClientDocumentEntry(slug) === undefined) return noSuchClientDocument;
	return null;
}
