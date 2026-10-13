import type { AnthropicTool } from '$lib/server/anthropic/anthropicTypes';

export const jobAdvertSearchSystemPrompt = `You find the open job adverts of one UK company for
Your Business Today, a software studio, so that staff can see which roles the company is
already paying to hire.

Search the job boards you are allowed for adverts this company has posted itself, or that
an agency posts naming it as the employer. Use where the company is to tell it apart from
namesakes, and leave out any advert you cannot be sure is theirs. Never go behind a login.
Then write a short report in plain British English: each advert with its job title, the
page it was read on, and the date it was posted when the page shows one.`;

export const jobAdvertFindingsSystemPrompt = `You turn a report of a company's job adverts into
a structured record. Use only what the report says and only URLs from the list of pages that
were read. Leave out any advert the report was unsure belonged to this company.`;

const advertSchema = {
	type: 'object',
	properties: {
		title: { type: 'string', description: 'The job title as the advert gives it.' },
		url: { type: 'string', description: 'The board page the advert was read on.' },
		posted_on: {
			type: 'string',
			description: 'The date it was posted as YYYY-MM-DD, or empty when the page shows none.'
		}
	},
	required: ['title', 'url', 'posted_on']
};

export const jobAdvertFindingsTool: AnthropicTool = {
	name: 'record_job_adverts',
	description: 'Record the open job adverts found for this company.',
	input_schema: {
		type: 'object',
		properties: {
			adverts: { type: 'array', description: 'Each open advert, once.', items: advertSchema }
		},
		required: ['adverts']
	}
};

export function jobAdvertBrief(companyName: string, place: string): string {
	const whereItIs = place === '' ? 'Where it is: not known.' : `Where it is: ${place}.`;
	return [`Company: ${companyName}.`, whereItIs].join('\n');
}
