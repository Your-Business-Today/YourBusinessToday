import { companyResearchGuidance } from './companyResearchGuidance';
import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { getClient } from '$lib/server/clients/getClient';
import { headcountBandOrder } from '$lib/data/headcountBands';
import { noSuchClient } from './describeClient';
import { objectSchema, textField } from '../actionTypes';
import { researchedLeadFromFindings } from '$lib/server/clients/researchedLeadFromFindings';
import { saveResearchedLead } from '$lib/server/clients/saveResearchedLead';
import { validateCompanyResearch } from '$lib/server/clients/validateCompanyResearch';
import type { CompanyResearchFindings } from '$lib/data/companyResearchRules';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const limits = companyResearchLimits;
const bandChoices = headcountBandOrder.filter(Boolean).join(', ');

const personSchema = objectSchema(
	{
		name: textField(`Their full name as the page gives it, at most ${limits.longestPersonName} characters`),
		role: textField(`What they do there, as the page says, at most ${limits.longestPersonRole} characters`),
		sourceUrl: textField('The public page they are named on')
	},
	['name', 'sourceUrl']
);

const findingsSchema = objectSchema(
	{
		clientId: textField('The client id, as list_clients gives it, when the company is already on the register'),
		name: textField(`The company's trading name, for a company not on the register yet, at most ${limits.longestName} characters`),
		website: textField("The company's own website, starting https://; leave it out if you found none"),
		sourceUrl: textField('The public page the profile was read from'),
		summary: textField(`Two or three plain sentences: what they do, who for, and how they run, at most ${limits.longestSummary} characters`),
		industry: textField(`The sector in a few words, at most ${limits.longestIndustry} characters`),
		location: textField(`Town or city and region, as the site states it, at most ${limits.longestLocation} characters`),
		postcode: textField('Their UK postcode, if a page gives it'),
		headcountBand: textField(`Their team size, only if a page says or clearly implies it: ${bandChoices}`),
		companyNumber: textField('Their Companies House number, eight letters or digits, only if a page gives it'),
		openingAngles: {
			type: 'array',
			items: { type: 'string' },
			description: `Up to ${limits.mostOpeningAngles} angles to open a conversation with, each grounded in something a page says`
		},
		people: { type: 'array', items: personSchema, description: `Up to ${limits.mostPeople} people the pages name` }
	},
	['sourceUrl', 'summary']
);

export const companyResearchActions: McpAction[] = [
	{
		name: 'save_company_research',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "save what you found researching a company — its website, a summary, its people and the pages each came from — to the clients register",
		guidance: companyResearchGuidance,
		inputSchema: findingsSchema,
		run: async (caller, input) => saveFindings(caller, input)
	}
];

async function saveFindings(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const findings = validateCompanyResearch(input);
	if (typeof findings === 'string') return findings;
	const client = findings.clientId === null ? null : await getClient(caller.supabase, findings.clientId);
	if (findings.clientId !== null && client === null) return noSuchClient;
	const lead = researchedLeadFromFindings(findings, client);
	const clientId = await saveResearchedLead(caller.supabase, lead, caller.accountId);
	return describeSavedResearch(lead.name, clientId, client === null, findings);
}

function describeSavedResearch(name: string, clientId: string, isNewLead: boolean, findings: CompanyResearchFindings): string {
	const { people, sourceUrl } = findings;
	const placed = isNewLead ? `${name} is on the register as a lead` : `${name}'s profile is updated`;
	const named = `People named on public pages: ${people.length}; anyone already listed was left as they were.`;
	return `${placed} — id ${clientId}. Profile read from ${sourceUrl}. ${named}`;
}
