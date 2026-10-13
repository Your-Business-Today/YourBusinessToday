import { describeJobAdverts } from './describeJobAdverts';
import { findJobAdverts } from '$lib/server/jobAdverts/findJobAdverts';
import { validateJobAdvertSubject } from '$lib/server/jobAdverts/jobAdvertSubject';
import { rolesWeReplaceOrAmplify } from '$lib/server/jobAdverts/rolesWeReplaceOrAmplify';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const roleNames = rolesWeReplaceOrAmplify.map((candidate) => candidate.role.toLowerCase()).join(', ');

export const jobAdvertActions: McpAction[] = [
	{
		name: 'read_company_job_adverts',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'the open job adverts of one company, read now from the UK job boards, each with its board page, its posted date when shown, and whether it is a role our software replaces or amplifies',
		guidance:
			`An advert for one of these roles is the pain costed at a salary, with a date: ${roleNames}. ` +
			'Only the job boards are searched, never LinkedIn; nothing is stored, and each call searches afresh, so read it once per company.',
		inputSchema: objectSchema(
			{
				companyName: textField('The company name, as the register or the client record gives it'),
				place: textField('Where the company is, such as its postcode or town, to tell it apart from namesakes')
			},
			['companyName']
		),
		run: async (_caller, input) => {
			const subject = { companyName: readText(input, 'companyName'), place: readText(input, 'place') };
			const problem = validateJobAdvertSubject(subject);
			if (problem !== null) return problem;
			return describeJobAdverts(await findJobAdverts(subject));
		}
	}
];
