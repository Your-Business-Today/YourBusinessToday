import { clientIdField, describeVisitorStanding, portalAdministratorOf, portalVisitorOf } from '../portalVisitorAccess';
import { describePortalPeople } from './describePortalPeople';
import { getPortalPeople } from '$lib/server/portal/getPortalPeople';
import { inputValues, isRefusal } from '$lib/server/portal/portalFormReading';
import { invitePortalPerson } from '$lib/server/portal/invitePortalPerson';
import { objectSchema, readText, textField } from '../actionTypes';
import { portalAddress } from '$lib/portal/portalAddress';
import { removePortalPerson } from '$lib/server/portal/removePortalPerson';
import { setPortalAdministrator } from '$lib/server/portal/setPortalAdministrator';
import { validatePortalInviteValues } from '$lib/server/portal/validatePortalPerson';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

type AdministratorStep = (caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>) => Promise<string>;

const contactIdField = textField('The person, by the contact id list_portal_people gives');
const administratorField = { type: 'boolean', description: 'True to make them an administrator of your portal' };
const yesOrNo = 'Say with isAdministrator true or false.';
const peopleGuidance =
	'Only an administrator of the organisation changes its people, as on the People page. Invite, remove or change ' +
	'someone only as the person asks, and say what happened in the words answered.';

export const portalPeopleActions: McpAction[] = [
	{
		name: 'list_portal_people',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary: 'for a client contact: who at your organisation can sign in to the portal, who administers it, and who has not signed in yet',
		inputSchema: objectSchema({ clientId: clientIdField }),
		run: async (caller, input) => {
			const visitor = await portalVisitorOf(caller, input);
			if (typeof visitor === 'string') return visitor;
			const people = await getPortalPeople(visitor.clientId);
			return `${describeVisitorStanding(visitor)}\n${describePortalPeople(people)}`;
		}
	},
	administratorAction('invite_portal_person', 'for a portal administrator: add someone at your organisation and email them their invitation to the portal', {
		name: textField('Their name'),
		email: textField('Their email address, where the invitation goes'),
		role: textField('Their role at your organisation'),
		isAdministrator: administratorField
	}, ['name', 'email'], invitePerson),
	administratorAction('remove_portal_person', 'for a portal administrator: take someone off your organisation so they can no longer sign in to its portal', { contactId: contactIdField }, ['contactId'], removePerson),
	administratorAction('set_portal_administrator', 'for a portal administrator: make someone at your organisation an administrator of its portal, or no longer one', { contactId: contactIdField, isAdministrator: administratorField }, ['contactId', 'isAdministrator'], setAdministrator)
];

function administratorAction(name: string, summary: string, fields: Record<string, unknown>, required: string[], step: AdministratorStep): McpAction {
	return {
		name,
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary,
		guidance: peopleGuidance,
		inputSchema: objectSchema({ clientId: clientIdField, ...fields }, required),
		run: async (caller, input) => {
			const visitor = await portalAdministratorOf(caller, input);
			if (typeof visitor === 'string') return visitor;
			return step(caller, visitor, input);
		}
	};
}

async function invitePerson(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const invite = validatePortalInviteValues(inputValues(input), input.isAdministrator === true);
	if (isRefusal(invite)) return invite.refusal;
	const refusal = await invitePortalPerson(visitor, invite, portalAddress.origin, caller.accountId);
	if (refusal !== null) return refusal.refusal;
	return `Invitation sent to ${invite.email}.`;
}

async function removePerson(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const contactId = readText(input, 'contactId');
	const idRefusal = validateRecordId('contactId', contactId);
	if (idRefusal !== null) return idRefusal;
	const refusal = await removePortalPerson(visitor, contactId, caller.accountId);
	if (refusal !== null) return refusal.refusal;
	return 'Removed. They can no longer sign in to your portal.';
}

async function setAdministrator(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const contactId = readText(input, 'contactId');
	const idRefusal = validateRecordId('contactId', contactId);
	if (idRefusal !== null) return idRefusal;
	if (typeof input.isAdministrator !== 'boolean') return yesOrNo;
	const refusal = await setPortalAdministrator(visitor, { contactId, isAdministrator: input.isAdministrator }, caller.accountId);
	if (refusal !== null) return refusal.refusal;
	return `Saved: they are ${input.isAdministrator ? 'now' : 'no longer'} an administrator of your portal.`;
}
