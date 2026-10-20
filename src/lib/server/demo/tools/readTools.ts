import {
	describeBrain,
	describeBusiness,
	describeInbox,
	describeLog,
	describeSystems
} from '$lib/data/demo/describeDemoBusiness';
import { pounds } from '$lib/data/demo/demoMoney';
import { findMoneyAndOpportunity } from '$lib/data/demo/moneyAndOpportunity';
import type { DemoBusiness } from '$lib/data/demo/demoBusiness';
import { noInput, readsOnly, type DemoTool } from './demoTool';

export const readTools: DemoTool[] = [
	{
		name: 'get_current_context',
		title: 'Where you are',
		description:
			'Start here. Says which business this is, that it is a demo on made-up data in a private ' +
			'copy only this link reaches, and what you can ask and do.',
		inputSchema: noInput,
		annotations: readsOnly,
		run: (business, today) => ({ answer: currentContext(business, today) })
	},
	{
		name: 'read_business',
		title: 'Read the whole business',
		description:
			'The people, clients, jobs, quotes, invoices and subscriptions, with the ids the action ' +
			'tools take. Answer questions from this rather than guessing.',
		inputSchema: noInput,
		annotations: readsOnly,
		run: (business, today) => ({ answer: describeBusiness(business, today) })
	},
	{
		name: 'find_money_and_opportunity',
		title: 'Where the money is leaking',
		description:
			'Where the business is losing money or missing work, each with a figure: work done but ' +
			'not invoiced, overdue invoices, quotes never followed up, subscriptions paid twice. ' +
			'Each names the tool that puts it right.',
		inputSchema: noInput,
		annotations: readsOnly,
		run: (business, today) => ({ answer: moneyAndOpportunity(business, today) })
	},
	{
		name: 'read_inbox',
		title: 'Read the shared inbox',
		description: 'The recent email in the shared info@ mailbox, each summarised.',
		inputSchema: noInput,
		annotations: readsOnly,
		run: (business) => ({ answer: describeInbox(business) })
	},
	{
		name: 'read_linked_systems',
		title: 'How the systems join up',
		description:
			'The systems the business runs on (email, Xero, SharePoint, CRM, its brain), what each ' +
			'holds and what Claude reaches through it, and where the real build runs.',
		inputSchema: noInput,
		annotations: readsOnly,
		run: (business) => ({ answer: describeSystems(business) })
	},
	{
		name: 'read_brain',
		title: 'What the business remembers',
		description:
			'Everything the business has taught its Your Brain Today brain about how it works. Read ' +
			'this before chasing, pricing or invoicing: it holds the rules the people follow.',
		inputSchema: noInput,
		annotations: readsOnly,
		run: (business) => ({ answer: describeBrain(business) })
	}
];

function currentContext(business: DemoBusiness, today: string): string {
	return [
		`You are connected to the Your Business Today demo as ${business.name}, ${business.trade}, in ${business.town}. Today is ${today}.`,
		'Everything here is made up, and this is one private copy: what you change here is seen only by whoever holds this link, and never touches a real business.',
		'Read the business with read_business, find where it is losing money with find_money_and_opportunity, and read its brain with read_brain before acting. The action tools raise an invoice, chase an invoice or a quote, cancel a subscription and teach the brain. reset_demo starts the copy fresh.',
		'',
		describeLog(business)
	].join('\n');
}

function moneyAndOpportunity(business: DemoBusiness, today: string): string {
	const findings = findMoneyAndOpportunity(business, today);
	if (findings.length === 0) return 'Nothing is leaking: every job is invoiced, nothing is overdue, every quote is followed up and no subscription is paid twice.';
	const total = findings.reduce((sum, finding) => sum + finding.figure, 0);
	const lines = findings.map(
		(finding) => `- ${finding.title}: ${pounds(finding.figure)}. ${finding.sentence} Put right with ${finding.fixWith}.`
	);
	return [`${pounds(total)} is leaking or waiting across ${findings.length} things:`, ...lines].join('\n');
}
