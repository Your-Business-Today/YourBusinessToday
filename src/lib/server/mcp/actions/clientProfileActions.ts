import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { getClient } from '$lib/server/clients/getClient';
import { headcountBandOrder } from '$lib/data/headcountBands';
import { noSuchClient } from './describeClient';
import { objectSchema, proseField, readText, textField } from '../actionTypes';
import { updateCompanyProfile } from '$lib/server/clients/updateCompanyProfile';
import { validateCompanyProfileChanges } from '$lib/server/clients/validateCompanyProfileChanges';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const namedBands = headcountBandOrder.filter((band) => band !== '');
const nothingToChange = 'Nothing was given to change: send the fields that change, and only those.';

const profileFields = {
	clientId: textField('The client id, as given by list_clients'),
	website: textField(`Their own website, at most ${companyResearchLimits.longestWebsite} characters`),
	industry: textField(`What they do, at most ${companyResearchLimits.longestIndustry} characters`),
	location: textField(`Where they are, at most ${companyResearchLimits.longestLocation} characters`),
	postcode: textField('Their postcode, such as KT1 1AA'),
	headcountBand: textField(`Their team size: ${namedBands.join(', ')}`),
	companyNumber: textField('Their Companies House number, 8 letters or digits'),
	summary: proseField(`Who they are and what they are building, at most ${companyResearchLimits.longestSummary} characters`),
	openingAngles: proseField('The ways in to a first conversation, one a line'),
	sourceUrl: textField('The public page the profile was read from')
};

export const clientProfileActions: McpAction[] = [
	{
		name: 'update_company_profile',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "change a client's company profile and website by hand — only the fields you give change",
		guidance:
			'Send the fields that change and leave the rest out; what is not sent is kept. What a Claude found on the web ' +
			'goes through save_company_research instead, which records where it was read and when.',
		inputSchema: objectSchema(profileFields, ['clientId']),
		run: async (caller, input) => changeProfile(caller, input)
	}
];

async function changeProfile(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const { clientId: _clientId, ...fields } = input;
	const changedFields = Object.keys(fields);
	if (changedFields.length === 0) return nothingToChange;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const changes = validateCompanyProfileChanges(fields, client.profile);
	if (typeof changes === 'string') return changes;
	const { website, ...profileChanges } = changes;
	await updateCompanyProfile(caller.supabase, client.id, website ?? client.website, { ...client.profile, ...profileChanges });
	return `${client.name}'s profile is saved.`;
}
