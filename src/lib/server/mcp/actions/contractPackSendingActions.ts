import { planSendingOfPack } from '$lib/server/contractPacks/packSendingDoor';
import { sendContractPack, undeliveredPackNotices } from '$lib/server/contractPacks/sendContractPack';
import { emailDeliveries } from '$lib/data/emailDelivery';
import { validateRecordId } from '$lib/data/isUuid';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { describePackSending } from './describePackSending';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { PackSendingPlan } from '$lib/data/contractPack';
import type { McpCaller } from '../resolveMcpCaller';
import { emailSenders, sendsEmailFrom } from '../sendsEmail';

const sendingGuidance =
	'Sending a pack emails one client contact one link to the pack in their client portal, where they read, comment on and ' +
	'sign each document. Call preview_contract_pack_sending first and show the person exactly what it says goes; send only ' +
	'on their yes. The pack goes to the contact named, else the contact whose email is the organisation\'s signatory email, ' +
	'else the client\'s main contact, who needs a portal sign-in (invite_client_contact) to open it.';

const fields = {
	organisationId: textField("The client organisation's id, as list_organisations gives it"),
	packId: textField('The pack id, as read_contract_pack gives it'),
	contactId: textField('The client contact to send it to, as read_client gives it; leave out for the signatory or main contact')
};

export const contractPackSendingActions: McpAction[] = [
	{
		name: 'preview_contract_pack_sending',
		area: 'clients',
		audience: 'admin',
		isWrite: false,
		summary: "show exactly what sending a client's contract pack would send — from which address, to whom, each document and version — without sending it",
		guidance: sendingGuidance,
		inputSchema: objectSchema(fields, ['organisationId', 'packId']),
		run: async (caller, input) => previewSending(caller, input)
	},
	{
		name: 'send_contract_pack',
		area: 'clients',
		audience: 'admin',
		isWrite: true,
		summary: sendsEmailFrom(emailSenders.yourBusinessToday, "email a client contact one link to read and sign their contract pack in the client portal"),
		guidance: sendingGuidance,
		inputSchema: objectSchema(fields, ['organisationId', 'packId', 'contactId']),
		run: async (caller, input) => sendPack(caller, input)
	}
];

async function previewSending(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const plan = await planFromInput(caller, input);
	if (typeof plan === 'string') return plan;
	return describePackSending(plan);
}

async function sendPack(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const plan = await planFromInput(caller, input);
	if (typeof plan === 'string') return plan;
	const delivery = await sendContractPack(caller.supabase, plan);
	if (delivery !== emailDeliveries.sent) return undeliveredPackNotices[delivery];
	const { name, email } = plan.contact;
	return `Sent to ${name} <${email}>. The pack is with them in the client portal.`;
}

async function planFromInput(caller: McpCaller, input: Record<string, unknown>): Promise<PackSendingPlan | string> {
	const organisationId = readText(input, 'organisationId');
	const refusal = validateRecordId('organisationId', organisationId);
	if (refusal !== null) return refusal;
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null) return noSuchOrganisation;
	const request = { packId: readText(input, 'packId'), contactId: readOptionalText(input, 'contactId') };
	return planSendingOfPack(caller.supabase, organisation, request);
}
