import type { ClientDocumentEntry } from './clientDocumentCatalogue';

export const internalDocumentEntries: ClientDocumentEntry[] = [
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
	},
	{
		slug: 'dpia-pack',
		title: 'DPIA Pack',
		summary:
			'YBT’s side of a client’s data protection impact assessment: the processing, how the data moves, where it is held, security, retention and deletion, and the risks.',
		audience: 'internal'
	},
	{
		slug: 'transfer-risk-assessment',
		title: 'Transfer Risk Assessment',
		summary:
			'The assessment behind Microsoft support access, Anthropic, Resend, Supabase and Vercel reaching client data from outside the United Kingdom.',
		audience: 'internal'
	},
	{
		slug: 'ip-assignment-and-waiver',
		title: 'Assignment of Rights and Waiver of Moral Rights',
		summary:
			'Signed as a deed by everyone who writes for YBT, so that YBT owns what they make and can assign it to a client under MSA clause 9, and so that they keep client data confidential.',
		audience: 'internal'
	}
];
