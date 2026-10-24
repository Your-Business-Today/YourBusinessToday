export type CaseStudyOutcome = {
	headline: string;
	detail: string;
};

export type CaseStudyBusiness = {
	id: string;
	kind: string;
	summary: string;
	needed: string;
	outcomes: CaseStudyOutcome[];
};

export const caseStudyPath = '/case-study';

/** Three businesses that run on a portal we built, by kind only: a client's portal is its own and so is its name. No dates or build lengths, because we now promise faster than any of them took. */
export const caseStudyBusinesses: CaseStudyBusiness[] = [
	{
		id: 'construction-company',
		kind: 'A construction company',
		summary:
			'Every project at the stage it is really at. RFIs, variations, the monthly valuation and a thirteen week cashflow read from Xero, with the day on site arriving as messages and photographs.',
		needed:
			'The building was never the problem. It was everything around it. The day on site arrived in the office as messages and photographs that somebody had to turn into a report for the client. Drawings came back marked up. Valuations were put together by hand. The person who knew where everything was could never take a Friday off. The idea that fixed it fits in one sentence: everything that reaches the business is a communication, a person makes one decision about it, and the portal groups it and writes what has to be written.',
		outcomes: [
			{
				headline: 'Every project',
				detail: 'at the stage it is really at, with the decisions that need the owner listed beside it.'
			},
			{
				headline: '13 weeks',
				detail: 'of cash ahead, read from the bills and invoices in Xero, with the lowest week flagged.'
			},
			{
				headline: 'One decision',
				detail: 'per email, photograph or drawing that arrives. The portal files it and writes it up.'
			},
			{
				headline: 'Their own AI',
				detail: 'reads a job or raises a request from the assistant the team already use.'
			}
		]
	},
	{
		id: 'fire-door-company',
		kind: 'A fire door company',
		summary:
			'Surveys that become quotes and quotes that become jobs. Every doorset inspected and certified on record, and the handover pack that proves the work was done.',
		needed:
			'A fire door company lives on proof. Every doorset has to be surveyed, every inspection recorded and every certificate to hand the day the building owner asks for it. The quote, the job and the invoice have to agree without anyone typing the same thing three times.',
		outcomes: [
			{
				headline: 'Every doorset',
				detail: 'on its own record, from the survey through each inspection to the certificate.'
			},
			{
				headline: 'Quote to job',
				detail: 'a survey becomes a quote and an accepted quote becomes the job, in step with Xero.'
			},
			{
				headline: 'The handover pack',
				detail: 'put together from the job’s own records, with the certificates in it.'
			},
			{
				headline: 'Their own AI',
				detail: 'reads a job, raises a to-do or files an email from the assistant the team already use.'
			}
		]
	},
	{
		id: 'property-management-company',
		kind: 'A property management company',
		summary:
			'Properties, tenants and the jobs on each one. Visits and work orders for the team on the road, key holdings, compliance certificates and the invoices that follow.',
		needed:
			'A property management company is judged on response. A fault is reported, a visit is booked, the work is done and proved, and the certificate, the invoice and the key all have to be where they should be, whoever was on the road that day.',
		outcomes: [
			{
				headline: 'Every property',
				detail: 'with its tenants, its certificates, its keys and the jobs on it in one place.'
			},
			{
				headline: 'Every visit',
				detail: 'booked, done and recorded by the team on the road, photographs and receipts included.'
			},
			{
				headline: 'Invoiced from the work',
				detail: 'work orders, valuations and variations become the invoice in Xero without being retyped.'
			},
			{
				headline: 'Their own AI',
				detail: 'answers what needs them today and raises the to-do, from the assistant the team already use.'
			}
		]
	}
];
