import type { AnthropicTool } from '$lib/server/anthropic/anthropicTypes';

export const personSearchSystemPrompt = `You research a person for Your Business Today, a UK
software studio that builds internal tools, client portals and AI assistants for businesses,
so that staff know who they are calling before the first conversation.

You are given what we already hold: their name, the companies they are appointed to on
Companies House, their part in each, and where those companies are. Search the open web
for this person's public business presence — their companies' websites, press coverage,
trade directories, awards, talks, projects, public bios. Use what we hold to tell them apart
from namesakes, and say plainly when you cannot be sure a page is about the same person.

Read only what is public. Never go behind a login, never report private life, family,
health, politics or anything outside their business capacity, and never guess. Then write a
short report in plain British English: a summary of who they are in business, each role or
position you found with the page it came from, anything notable they have done publicly,
and which pages would be worth keeping as links on their record.`;

export const personFindingsSystemPrompt = `You turn a research report about a person into a
structured record. Use only what the report says and only URLs from the list of pages that
were read. Leave out anything the report was unsure belonged to this person. Write in plain
British English.`;

const foundRoleSchema = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		organisation: { type: 'string' },
		source_url: { type: 'string' }
	},
	required: ['title', 'organisation', 'source_url']
};

const foundLinkSchema = {
	type: 'object',
	properties: { label: { type: 'string' }, url: { type: 'string' } },
	required: ['label', 'url']
};

export const personFindingsTool: AnthropicTool = {
	name: 'record_person_findings',
	description: 'Record what the open web says about this person in a business capacity.',
	input_schema: {
		type: 'object',
		properties: {
			summary: {
				type: 'string',
				description:
					'Three or four sentences: who they are in business, what they are known for, ' +
					'what they seem to be building or growing. Empty if nothing reliable was found.'
			},
			roles: {
				type: 'array',
				description: 'Each position or role found, with the page it came from.',
				items: foundRoleSchema
			},
			links: {
				type: 'array',
				description:
					'Pages worth keeping on their record — a company site, an about page, a profile, ' +
					'press — each with a short label such as "Company site" or "Interview, 2025".',
				items: foundLinkSchema
			}
		},
		required: ['summary', 'roles', 'links']
	}
};
