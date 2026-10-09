import { headcountBandOrder } from '$lib/data/headcountBands';
import type { AnthropicTool } from '$lib/server/anthropic/anthropicTypes';

const namedPersonSchema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		role: { type: 'string' },
		evidence_url: { type: 'string', description: 'The page the name appears on.' }
	},
	required: ['name', 'role', 'evidence_url']
};

export const companyResearchTool: AnthropicTool = {
	name: 'record_company_profile',
	description: 'Record what the public website says about this company and the people at it.',
	input_schema: {
		type: 'object',
		properties: {
			company_name: { type: 'string', description: 'The trading name as the site gives it.' },
			summary: {
				type: 'string',
				description:
					'Two or three plain sentences: what they do, who for, and anything that suggests ' +
					'how they run (growth, hiring, systems they mention, awards, recent news).'
			},
			industry: { type: 'string', description: 'The sector in a few words, e.g. "Residential construction".' },
			location: { type: 'string', description: 'Town or city and region, as stated on the site; empty if unknown.' },
			headcount_band: {
				type: 'string',
				enum: headcountBandOrder,
				description: 'Team size if the site says or clearly implies it; empty string if unknown.'
			},
			people: {
				type: 'array',
				description: 'Named staff, with role, only where the site names them.',
				items: namedPersonSchema
			},
			opening_angles: {
				type: 'array',
				items: { type: 'string' },
				description:
					'Up to four specific angles a software studio could open a conversation with, ' +
					'each grounded in something the site actually says.'
			}
		},
		required: ['company_name', 'summary', 'industry', 'location', 'headcount_band', 'people', 'opening_angles']
	}
};

export const companyResearchSystemPrompt = `You research a company for Your Business Today, a UK
software studio that builds internal tools, client portals and AI assistants for businesses,
so that staff arrive at the first conversation already informed.

You are given the text of the company's public website. Record only what the pages say or
clearly imply; never guess a fact, a person or a role. Only name people the site names, in a
business capacity, and give the page each one appears on. Leave a field empty when the
site does not answer it. Write in plain British English.`;
