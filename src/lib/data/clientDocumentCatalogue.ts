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
	{
		slug: 'data-breach-procedure',
		title: 'Data Breach Procedure',
		summary:
			'Contain, log, assess, tell the client within 24 hours, fix and review — with the breach log.',
		audience: 'internal'
	},
	{
		slug: 'data-subject-requests-procedure',
		title: 'Data Subject Requests and Erasure Procedure',
		summary:
			'Passing on requests, finding one person’s data everywhere it lives, erasure, backups and the suppression list.',
		audience: 'internal'
	},
	{
		slug: 'processing-records',
		title: 'Processor Position and Records of Processing',
		summary:
			'Why YBT is a processor and the rules that keep it one, the decisions recorded, the processor contract log and the Article 30 record per client.',
		audience: 'internal'
	}
];

export function findClientDocumentEntry(slug: string): ClientDocumentEntry | undefined {
	return clientDocumentCatalogue.find((entry) => entry.slug === slug);
}

export function clientDocumentsFor(audience: ClientDocumentAudience): ClientDocumentEntry[] {
	return clientDocumentCatalogue.filter((entry) => entry.audience === audience);
}
